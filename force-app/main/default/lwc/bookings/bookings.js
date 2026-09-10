import { LightningElement } from 'lwc';
import getBookings from '@salesforce/apex/TravelPackageController.getBookings';
import deleteBooking from '@salesforce/apex/TravelPackageController.deleteBooking';
import Toast from 'lightning/toast';
import ToastContainer from 'lightning/toastContainer';

export default class Bookings extends LightningElement {

    bookings;
    error;
    showModal = false;
    selectedBookingId;

    connectedCallback() {
        console.log('Bookings component loaded');
        this.loadBookings(); // 🔥 initial load

        this.bookingHandler = this.handleBookingUpdate.bind(this);
        window.addEventListener('bookingupdate', this.bookingHandler);

        const container = ToastContainer.instance();
        container.maxToasts = 5;
        container.toastPosition = 'top-right';
        container.toastmargin = '5rem';
    }

    disconnectedCallback() {
        window.removeEventListener('bookingupdate', this.bookingHandler);
    }

    // 🔥 Imperative fetch
    async loadBookings() {
        try {
            const result = await getBookings();


            this.bookings = [...result];
            console.log('Fetched bookings:', JSON.stringify(result));

        } catch (error) {
            this.error = error;
            console.error('Error fetching bookings', error);
        }
    }

    // 🔥 Event → refresh instantly
    handleBookingUpdate() {
        console.log('Booking update received');
        this.loadBookings();
    }

    handleCancelClick(event) {
        this.selectedBookingId = event.currentTarget.dataset.id;
        this.showModal = true;
    }

    async handleConfirmDelete() {
        try {
            await deleteBooking({ bookingId: this.selectedBookingId });

            this.showModal = false;

            // 🔥 instant refresh
            await this.loadBookings();

            Toast.show({
                label: 'Success',
                message: 'Booking cancelled successfully!',
                variant: 'success'
            });

        } catch (error) {
            console.error('Delete error:', error);
        }
    }

    handleCloseModal() {
        this.showModal = false;
    }
}