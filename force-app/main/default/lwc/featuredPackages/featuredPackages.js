import { LightningElement, wire, track } from 'lwc';
import searchPackages from '@salesforce/apex/TravelPackageController.searchPackages';
import getFeaturedPackages from '@salesforce/apex/TravelPackageController.getFeaturedPackages';
import travelImage from '@salesforce/resourceUrl/beach_image';
import createBooking from '@salesforce/apex/TravelPackageController.createBooking';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { CurrentPageReference } from 'lightning/navigation';

export default class FeaturedPackages extends LightningElement {

    packages;
    travelImage = travelImage;
    currentIndex = 0;
    pageSize = 4;
    selectedPackage;
    @track searchKey = '';
    @track isSearching = false;
    @track originalPackages = [];
    showModal = false;

    @wire(CurrentPageReference)
    pageRef;

    get pageName() {
        console.log('pageRef==>' + JSON.stringify(this.pageRef));
        return this.pageRef?.attributes?.name;
    }

    @wire(getFeaturedPackages)
    wiredPackages({ data, error }) {
        if (data) {
            console.log(this.pageName);
            this.packages = data;
            this.originalPackages = data;
            console.log('Featured packages:', JSON.stringify(data));
        }
        if (error) {
            console.error('Error fetching featured packages', error);
        }
    }
    get visiblePackages() {
        if (!this.packages) return [];
        return this.packages.slice(this.currentIndex, this.currentIndex + this.pageSize);
    }
    get isNextDisabled() {
        return this.currentIndex + this.pageSize >= this.packages?.length;
    }

    get isPrevDisabled() {
        return this.currentIndex === 0;
    }

    // 👉 Next 4
    nextSlide() {
        if (this.currentIndex + this.pageSize < this.packages.length) {
            this.currentIndex += this.pageSize;
        }
    }

    // 👉 Previous 4
    prevSlide() {
        if (this.currentIndex - this.pageSize >= 0) {
            this.currentIndex -= this.pageSize;
        }
    }
    //     handleBooking(event) {
    //     const packageId = event.target.dataset.id;

    //     createBooking({ packageId: packageId })
    //         .then(result => {
    //             this.dispatchEvent(
    //                 new ShowToastEvent({
    //                     title: 'Success',
    //                     message: 'Booking confirmed!',
    //                     variant: 'success'
    //                 })
    //             );

    //             // 🔥 Notify navigation/header
    //             this.notifyBookingUpdate();

    //         })
    //         .catch(error => {
    //             console.error('Booking error', error);
    //         });
    // }
    // notifyBookingUpdate() {
    //     const event = new CustomEvent('bookingupdate');
    //     window.dispatchEvent(event);
    // }
    handleBooking(event) {
        const packageId = event.target.dataset.id;

        // 👉 Find selected package
        this.selectedPackage = this.packages.find(pkg => pkg.Id === packageId);

        // 👉 Open modal
        this.showModal = true;
    }
    handleCloseModal() {
        this.showModal = false;
    }

    handleSearchChange(event) {
        this.searchKey = event.target.value;

        if (!this.searchKey) {
            this.packages = this.originalPackages;
            this.isSearching = false;
        }
    }

    // handleSearch() {
    //     if (!this.searchKey) {
    //         this.packages = this.originalPackages;
    //         return;
    //     }

    //     searchPackages({ keyword: this.searchKey })
    //         .then(result => {
    //             this.packages = result;
    //         })
    //         .catch(error => {
    //             console.error('Search Error:', error);
    //         });
    // }

    @wire(CurrentPageReference)
    getStateParameters(currentPageReference) {
        if (currentPageReference) {
            const keyword = currentPageReference.state?.search;

            if (keyword) {
                this.searchKey = keyword;

                // auto trigger search
                this.executeSearch(keyword);
            }
        }
    }

    executeSearch(keyword) {
        if (!keyword) {
            this.packages = this.originalPackages;
            this.isSearching = false;
            return;
        }

        this.isSearching = true;

        searchPackages({ keyword })
            .then(result => {
                this.packages = result;
            })
            .catch(error => {
                console.error('Search Error:', error);
            });
    }

    handleSearch() {
        this.executeSearch(this.searchKey);
    }
}