import { LightningElement, wire, track } from 'lwc';
import getFeaturedPackages from '@salesforce/apex/TravelPackageController.getFeaturedPackages';
import getTopRatedPackages from '@salesforce/apex/TravelPackageController.getTopRatedPackages';
import searchPackages from '@salesforce/apex/TravelPackageController.searchPackages';
import TravelImage_bg from '@salesforce/resourceUrl/TravelImage_bg';
import topDestinations from '@salesforce/label/c.Top_des';
import { NavigationMixin } from 'lightning/navigation';
export default class HomePage extends NavigationMixin(LightningElement) {

    @track packages = [];
    @track originalPackages = [];
    @track searchKey = '';
    @track isSearching = false;

    @track selectedPackage;
    @track isDetails = false;

    @track isHome = true;
    @track isFeatured = false;
    @track isBookings = false;
    @track isLogin = false;

    currentIndex = 0;
    intervalId;
    destinations = [];
    @track filteredPackages = [];


    // FETCH DATA
    @wire(getTopRatedPackages)
    wiredPackages({ data, error }) {
        if (data) {
            this.packages = data;
            this.originalPackages = data;
        } else if (error) {
            console.error(error);
        }
    }



    // NAVIGATION
    handleNavigation(event) {
        const page = event.detail;

        this.isHome = false;
        this.isFeatured = false;
        this.isBookings = false;
        this.isLogin = false;
        this.isDetails = false;

        if (page === 'home') this.isHome = true;
        if (page === 'featured') this.isFeatured = true;
        if (page === 'bookings') this.isBookings = true;
        if (page === 'login') this.isLogin = true;

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // AUTO SLIDE
    connectedCallback() {
        this.destinations = topDestinations.split(',').map(item => item.trim());
        this.startAutoSlide();
    }
    handleDestinationClick(event) {
        const selectedDestination = event.currentTarget.dataset.name;

        console.log('Selected Destination:', selectedDestination);

        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/featured?search=' + encodeURIComponent(selectedDestination)
            }
        });

    }

    disconnectedCallback() {
        this.stopAutoSlide();
    }

    startAutoSlide() {
        if (!this.intervalId) {
            this.intervalId = setInterval(() => {
                this.nextSlide();
            }, 2000);
        }
    }

    stopAutoSlide() {
        clearInterval(this.intervalId);
        this.intervalId = null;
    }

    pauseSlide() {
        this.stopAutoSlide();
    }

    resumeSlide() {
        this.startAutoSlide();
    }

    nextSlide() {
        if (this.currentIndex + 4 < this.packages.length) {
            this.currentIndex += 4;
        } else {
            this.currentIndex = 0;
        }
    }

    get visiblePackages() {
        return this.packages.slice(this.currentIndex, this.currentIndex + 4);
    }

    // SEARCH
    handleSearchChange(event) {
        this.searchKey = event.target.value;

        if (!this.searchKey) {
            this.packages = this.originalPackages;
            this.isSearching = false;
            this.currentIndex = 0;
        }
    }

    handleSearch() {
        if (!this.searchKey) {
            this.packages = this.originalPackages;
            return;
        }

        searchPackages({ keyword: this.searchKey })
            .then(result => {
                this.packages = result;
                this.currentIndex = 0;
            })
            .catch(error => {
                console.error('Search Error:', error);
            });
    }

    // ✅ VIEW DETAILS (MAIN LOGIC)
    handleClickDetails(event) {
        this.isDetails = true;
        console.log('Clicked package ID:', event.currentTarget.dataset.id);

        const packageId = event.currentTarget.dataset.id;

        this.selectedPackage = this.packages.find(
            pkg => pkg.Id === packageId
        );

        console.log('Package ID:', JSON.stringify(this.packages));
        console.log('Selected Package:', JSON.stringify(this.selectedPackage));
    }

    // CLOSE MODAL
    closeDetails() {
        this.isDetails = false;
        this.selectedPackage = null;
    }

    // HERO IMAGE
    get heroStyle() {
        return `background-image: url(${TravelImage_bg}); background-size: cover; background-position: center;`;
    }

    navigateFeatured() {
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/featured'
            }
        });
    }
}