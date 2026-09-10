import { LightningElement, api, track } from 'lwc';
// import createBooking from '@salesforce/apex/TravelPackageController.createBooking';
import Toast from 'lightning/toast';
import ToastContainer from 'lightning/toastContainer';
import { NavigationMixin } from 'lightning/navigation';
import getPackageAvailability
    from '@salesforce/apex/TravelPackageController.getPackageAvailability';



export default class PackageDescription extends NavigationMixin(LightningElement) {

    @api packageData;
    @api pageName; // ✅ NEW: receive page name for context
    @track showBookingModal = false;
    // startDate;
    // endDate;
    availableDates = [];
    packageId;
    @track calendarDays = [];
    @track monthYear;
    isDataSelected = false;


    connectedCallback() {
        console.log('Modal Loaded:', JSON.stringify(this.packageData));
        console.log('Page Name:', this.pageName);

        // 🔥 Setup Toast Container (same as bookings)
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

        // Store Package Id
        this.packageId = event.target.dataset.id;
        console.log('Booking package ID:', this.packageId);
        // Check login
        const isLoggedIn = sessionStorage.getItem('isLoggedIn');

        // Guest User
        if (!isLoggedIn) {

            // Toast.show({
            //     label: 'Login Required',
            //     message: 'Please login to continue booking',
            //     variant: 'warning'
            // });

            setTimeout(() => {
                window.location.href = '/secur/logout.jsp?retUrl=/s/login';
            }, 3000);

            return;
        }
        console.log('User is logged in, fetching availability...');
        // Logged In User
        getPackageAvailability({
            packageId: this.packageId
        })
            .then(result => {
                console.log('Package availability:', JSON.stringify(result));

                this.availableDates =
                    result.map(
                        item => item.Available_Date__c

                    );
                this.showBookingModal = true;
                this.generateCalendar();

                console.log('Available dates:', JSON.stringify(this.availableDates));


            });
    }
    handleDateSelect(event) {

        this.startDate =
            event.currentTarget.dataset.date;



        let start =
            new Date(this.startDate);

        let end =
            new Date(start);

        end.setDate(
            end.getDate() +
            Number(this.packageData.Days__c)
        );

        this.endDate =
            end.toISOString().split('T')[0];
    }
    // START DATE
    handleStartDate(event) {
        this.startDate = event.target.value;
    }

    // END DATE
    handleEndDate(event) {
        this.endDate = event.target.value;
    }

    // CLOSE MODAL
    // closeModalDate() {
    //     this.showBookingModal = false;
    // }

    // CONFIRM BOOKING
    confirmBooking() {
        this.isDataSelected = true;
        this.showBookingModal = false;
        console.log('hiiii-----');

        console.log('selected' + this.isDataSelected);

        //     createBooking({
        //         packageId: this.packageId,
        //         startDate: this.startDate,
        //         endDate: this.endDate
        //     })
        //         .then(result => {

        //             Toast.show({
        //                 label: 'Success',
        //                 message: 'Booking confirmed!',
        //                 variant: 'success'
        //             });

        //         })
        //         .catch(error => {
        //             console.error('Booking error', error);

        //             Toast.show({
        //                 label: 'Error',
        //                 message: 'Booking failed!',
        //                 variant: 'error'
        //             });
        //         });
    }

    notifyBookingUpdate() {
        const event = new CustomEvent('bookingupdate');
        window.dispatchEvent(event);
    }

    today = new Date();

    calendarDays = [];

    generateCalendar() {

        const year = this.today.getFullYear();
        const month = this.today.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        let days = [];

        // Empty cells before first day
        for (let i = 0; i < firstDay.getDay(); i++) {
            days.push({
                key: `empty-${i}`,
                isEmpty: true
            });
        }

        // Actual dates
        for (let i = 1; i <= lastDay.getDate(); i++) {

            const fullDate =
                `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;

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

    handleDateSelect(event) {

        const selectedDate =
            event.currentTarget.dataset.date;

        if (!this.availableDates.includes(selectedDate)) {
            return;
        }
        // If same date clicked again, unselect it
        if (this.startDate === selectedDate) {
            this.startDate = null;
            this.endDate = null;
        } else {

            this.startDate = selectedDate;
            const duration =
                parseInt(this.packageData.Days__c);

            let endDate = new Date(selectedDate);

            endDate.setDate(
                endDate.getDate() + duration - 1
            );

            this.endDate =
                endDate.toISOString().split('T')[0];
        }




        this.generateCalendar();
    }

    previousMonth() {
        this.today =
            new Date(
                this.today.getFullYear(),
                this.today.getMonth() - 1,
                1
            );

        this.generateCalendar();
    }

    nextMonth() {
        this.today =
            new Date(
                this.today.getFullYear(),
                this.today.getMonth() + 1,
                1
            );

        this.generateCalendar();
    }
}