import { LightningElement, api, track } from 'lwc';
import Toast from 'lightning/toast';
import ToastContainer from 'lightning/toastContainer';
import getPackageAvailability from '@salesforce/apex/TravelPackageController.getPackageAvailability';

export default class PackageDescription extends LightningElement {

    @api packageData;
    @api pageName;

    @track showBookingModal = false;
    @track showPackageDetails = true;
    @track showBookNow = true;
    @track showTravellers = false;
    @track calendarDays = [];
    @track monthYear;
    @track startDate;
    @track endDate;

    availableDates = [];
    packageId;
    today = new Date();

    connectedCallback() {
        console.log('Modal Loaded:', JSON.stringify(this.packageData));
        console.log('Page Name:', this.pageName);

        const container = ToastContainer.instance();
        container.maxToasts = 5;
        container.toastPosition = 'top-right';
    }

    closeModal() {
        this.dispatchEvent(new CustomEvent('close'));
    }

    closeModalDate() {
        this.showBookingModal = false;
    }

    handleBooking(event) {
        this.packageId = event.currentTarget.dataset.id;
        console.log('Booking package ID:', this.packageId);

        const isLoggedIn = sessionStorage.getItem('isLoggedIn');

        if (isLoggedIn !== 'true') {
            console.log('User is not logged in. Redirecting to login page...');
            window.location.href = '/travel/login';
            return;
        }

        getPackageAvailability({
            packageId: this.packageId
        })
            .then(result => {
                console.log('Package availability:', JSON.stringify(result));

                // Salesforce Date values normally arrive as YYYY-MM-DD.
                // Normalize the value so selection also works if the API
                // returns an ISO datetime or Date-like value.
                this.availableDates = (result || [])
                    .map(item => this.normalizeDate(item.Available_Date__c))
                    .filter(date => date);

                console.log('Normalized available dates:', JSON.stringify(this.availableDates));

                // Start a fresh booking flow.
                this.startDate = null;
                this.endDate = null;
                this.showPackageDetails = true;
                this.showBookNow = true;
                this.showTravellers = false;
                this.showBookingModal = true;

                this.generateCalendar();
            })
            .catch(error => {
                console.error('Error fetching package availability:', error);

                Toast.show({
                    label: 'Error',
                    message: 'Unable to load package availability.',
                    variant: 'error'
                });
            });
    }

    normalizeDate(value) {
        if (!value) {
            return null;
        }

        // Keep an already-correct Salesforce Date value unchanged.
        if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            return value;
        }

        // Handle ISO datetime values without allowing timezone conversion
        // to move the date backward or forward.
        const match = String(value).match(/^(\d{4}-\d{2}-\d{2})/);
        return match ? match[1] : null;
    }

    handleDateSelect(event) {
        event.stopPropagation();

        const selectedDate = event.currentTarget.dataset.date;

        // Empty calendar cells have no date and cannot be selected.
        if (!selectedDate) {
            return;
        }

        const normalizedSelectedDate = this.normalizeDate(selectedDate);

        // Only dates returned by Package_Availability__c are selectable.
        if (!this.availableDates.includes(normalizedSelectedDate)) {
            console.log('Date is not available:', normalizedSelectedDate);
            return;
        }

        if (this.startDate === normalizedSelectedDate) {
            this.startDate = null;
            this.endDate = null;
        } else {
            this.startDate = normalizedSelectedDate;

            const duration = parseInt(this.packageData?.Days__c, 10) || 1;
            const endDate = new Date(`${normalizedSelectedDate}T00:00:00`);

            endDate.setDate(endDate.getDate() + duration - 1);
            this.endDate = this.formatDate(endDate);
        }

        console.log('Selected start date:', this.startDate);
        console.log('Calculated end date:', this.endDate);

        this.generateCalendar();
    }

    handleStartDate(event) {
        this.startDate = this.normalizeDate(event.target.value);
    }

    handleEndDate(event) {
        this.endDate = this.normalizeDate(event.target.value);
    }

    confirmBooking() {
        if (!this.startDate) {
            Toast.show({
                label: 'Warning',
                message: 'Please select a travel date before continuing.',
                variant: 'warning'
            });
            return;
        }

        if (!this.endDate) {
            Toast.show({
                label: 'Warning',
                message: 'Please select a valid travel date before continuing.',
                variant: 'warning'
            });
            return;
        }

        console.log('Next clicked');
        console.log('Package ID:', this.packageId || this.packageData?.Id);
        console.log('Start Date:', this.startDate);
        console.log('End Date:', this.endDate);

        // Close only the date-selection popup.
        this.showBookingModal = false;

        // Keep package details visible, but remove Book Now.
        this.showPackageDetails = true;
        this.showBookNow = false;

        // Show traveler details below the package details.
        this.showTravellers = true;
    }

    notifyBookingUpdate() {
        window.dispatchEvent(new CustomEvent('bookingupdate'));
    }

    generateCalendar() {
        const year = this.today.getFullYear();
        const month = this.today.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const days = [];

        for (let i = 0; i < firstDay.getDay(); i++) {
            days.push({
                key: `empty-${i}`,
                isEmpty: true,
                className: 'day empty',
                fullDate: null
            });
        }

        for (let i = 1; i <= lastDay.getDate(); i++) {
            const fullDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;

            const isAvailable = this.availableDates.includes(fullDate);
            const isSelected = this.startDate === fullDate;

            let className = 'day';

            if (isAvailable) {
                className += ' available';
            } else {
                className += ' unavailable';
            }

            if (isSelected) {
                className = 'day available selected';
            }

            days.push({
                key: fullDate,
                day: i,
                fullDate,
                className,
                isEmpty: false,
                isAvailable
            });
        }

        this.calendarDays = days;
        this.monthYear = firstDay.toLocaleString('default', {
            month: 'long',
            year: 'numeric'
        });
    }

    formatDate(date) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }

    previousMonth() {
        this.today = new Date(
            this.today.getFullYear(),
            this.today.getMonth() - 1,
            1
        );
        this.generateCalendar();
    }

    nextMonth() {
        this.today = new Date(
            this.today.getFullYear(),
            this.today.getMonth() + 1,
            1
        );
        this.generateCalendar();
    }
}