import { LightningElement, track, api } from 'lwc';
import createBooking from '@salesforce/apex/TravelPackageController.createBooking';


export default class Travellers extends LightningElement {

    showTravelerModal = true;
    @api packageId;
    // startDate;
    // endDate;

    @track travelers = [];

    counter = 1;

    connectedCallback() {
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

        const id = event.target.dataset.id;

        this.travelers =
            this.travelers
                .filter(
                    traveler => traveler.key != id
                )
                .map((traveler, index) => {
                    return {
                        ...traveler,
                        displayNumber: index + 1
                    };
                });
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
            {
                label: 'Male',
                value: 'Male'
            },
            {
                label: 'Female',
                value: 'Female'
            },
            {
                label: 'Other',
                value: 'Other'
            }
        ];
    }

    closeTravelerModal() {
        this.showTravelerModal = false;
    }

    confirmBooking() {

        createBooking({
            packageId: this.packageId,
            // startDate: this.startDate,
            // endDate: this.endDate
        })
            .then(result => {

                Toast.show({
                    label: 'Success',
                    message: 'Booking confirmed!',
                    variant: 'success'
                });

            })
            .catch(error => {
                console.error('Booking error', error);

                Toast.show({
                    label: 'Error',
                    message: 'Booking failed!',
                    variant: 'error'
                });
            });

        const invalidTraveler =
            this.travelers.some(
                traveler =>
                    !traveler.name ||
                    !traveler.age
            );

        if (invalidTraveler) {

            alert(
                'Please enter Name and Age for all travelers.'
            );

            return;
        }

        console.log(
            'Traveler Data:',
            JSON.stringify(this.travelers)
        );

    }
}