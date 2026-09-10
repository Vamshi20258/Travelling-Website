import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import logo from '@salesforce/resourceUrl/travelLogo';
import isUserLoggedIn from '@salesforce/apex/CommunityAuthController.isUserLoggedIn';

export default class NavigationHeader extends NavigationMixin(LightningElement) {

    logoUrl = logo;
    isLoggedIn = false;

    connectedCallback() {
        this.checkLoginStatus();
    }

    checkLoginStatus() {
        isUserLoggedIn()
            .then(result => {
                if (result && sessionStorage.getItem('isLoggedIn') === 'true') {
                    this.isLoggedIn = result;
                }
                console.log('User logged in:', this.isLoggedIn);
            })
            .catch(error => {
                console.error('Error checking login:', error);
            });
    }

    navigateHome() {
        this.navigateTo('/');
    }

    navigateFeatured() {
        this.navigateTo('/featured');
    }

    navigateBookings() {
        this.navigateTo('/mybookings');
    }

    navigateProfile() {
        this.navigateTo('/login');
    }

    // ✅ Logout
    handleLogout() {
        // window.location.href =  '/secur/logout.jsp?retUrl=/s/login';
        sessionStorage.clear();

        window.location.href = '/secur/logout.jsp?retUrl=/s/login';
        console.log('User logged out');

    }

    navigateTo(url) {
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: url
            }
        });
    }
}