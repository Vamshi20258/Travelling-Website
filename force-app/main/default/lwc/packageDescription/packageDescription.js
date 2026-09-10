import { LightningElement, api, track } from 'lwc';
import Toast from 'lightning/toast';
import ToastContainer from 'lightning/toastContainer';
import getPackageAvailability from '@salesforce/apex/TravelPackageController.getPackageAvailability';

export default class PackageDescription extends LightningElement {

    @api packageData;
    @api pageName;

    @track showBookingModal = false;
    @track showPackageDetails = true;
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

                this.availableDates = result.map(
                    item => item.Available_Date__c
                );

                this.startDate = null;
                this.endDate = null;
                this.showPackageDetails = true;
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

    handleDateSelect(event) {
        const selectedDate = event.currentTarget.dataset.date;

        if (!this.availableDates.includes(selectedDate)) {
            return;
        }

        if (this.startDate === selectedDate) {
            this.startDate = null;
            this.endDate = null;
        } else {
            this.startDate = selectedDate;

            const duration = parseInt(this.packageData?.Days__c, 10) || 1;
            const endDate = new Date(selectedDate);

            endDate.setDate(endDate.getDate() + duration - 1);
            this.endDate = endDate.toISOString().split('T')[0];
        }

        this.generateCalendar();
    }

    handleStartDate(event) {
        this.startDate = event.target.value;
    }

    handleEndDate(event) {
        this.endDate = event.target.value;
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

        // Stay on the same page/component. Only change the visible step.
        this.showBookingModal = false;
        this.showPackageDetails = false;
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
                className: 'day empty'
            });
        }

        for (let i = 1; i <= lastDay.getDate(); i++) {
            const fullDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;

            let className = 'day';

            if (this.availableDates.includes(fullDate)) {
                className = 'day available';
            }

            if (this.startDate === fullDate) {
                className = 'day selected';
            }

            days.push({
                key: fullDate,
                day: i,
                fullDate,
                className,
                isEmpty: false
            });
        }

        this.calendarDays = days;
        this.monthYear = firstDay.toLocaleString('default', {
            month: 'long',
            year: 'numeric'
        });
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