import { LightningElement, track, api } from 'lwc';
import createBooking from '@salesforce/apex/TravelPackageController.createBooking';
import Toast from 'lightning/toast';
import ToastContainer from 'lightning/toastContainer';

export default class Travellers extends LightningElement {

    @api packageId;
    @api startDate;
    @api endDate;

    @track travelers = [];

    connectedCallback() {
        const container = ToastContainer.instance();
        container.maxToasts = 5;
        container.toastPosition = 'top-right';

        this.addTraveler();
    }

    addTraveler() {
        this.travelers = [
            ...this.travelers,
            {
                key: Date.now() + Math.random(),
                displayNumber: this.travelers.length + 1,
                name: '',
                email: '',
                age: '',
                gender: ''
            }
        ];
    }

    removeTraveler(event) {
        const id = event.currentTarget.dataset.id;

        this.travelers = this.travelers
            .filter(traveler => traveler.key != id)
            .map((traveler, index) => ({
                ...traveler,
                displayNumber: index + 1
            }));
    }

    handleTravelerChange(event) {
        const id = event.target.dataset.id;
        const field = event.target.dataset.field;
        const value = event.target.value;

        this.travelers = this.travelers.map(traveler => {
            if (traveler.key == id) {
                return {
                    ...traveler,
                    [field]: value
                };
            }
            return traveler;
        });
    }

    get totalTravelers() {
        return this.travelers.length;
    }

    get genderOptions() {
        return [
            { label: 'Male', value: 'Male' },
            { label: 'Female', value: 'Female' },
            { label: 'Other', value: 'Other' }
        ];
    }

    confirmBooking() {
        // Validate traveler information before creating the booking.
        const invalidTraveler = this.travelers.some(
            traveler => !traveler.name || !traveler.age
        );

        if (invalidTraveler) {
            Toast.show({
                label: 'Warning',
                message: 'Please enter Name and Age for all travelers.',
                variant: 'warning'
            });
            return;
        }

        if (!this.packageId || !this.startDate || !this.endDate) {
            Toast.show({
                label: 'Warning',
                message: 'Package and travel dates are required.',
                variant: 'warning'
            });
            return;
        }

        console.log('Package ID:', this.packageId);
        console.log('Start Date:', this.startDate);
        console.log('End Date:', this.endDate);
        console.log('Traveler Data:', JSON.stringify(this.travelers));

        createBooking({
            packageId: this.packageId,
            startDate: this.startDate,
            endDate: this.endDate
        })
            .then(() => {
                Toast.show({
                    label: 'Success',
                    message: 'Booking confirmed!',
                    variant: 'success'
                });

                window.dispatchEvent(new CustomEvent('bookingupdate'));
            })
            .catch(error => {
                console.error('Booking error:', error);

                const message = error?.body?.message || 'Booking failed!';

                Toast.show({
                    label: 'Error',
                    message,
                    variant: 'error'
                });
            });
    }
}