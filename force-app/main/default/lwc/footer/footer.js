import { LightningElement } from 'lwc';
import fb from '@salesforce/resourceUrl/facebookicon';
import instagram from '@salesforce/resourceUrl/instagramicon';
import twitter from '@salesforce/resourceUrl/twittericon';
import whatsapp from '@salesforce/resourceUrl/whatsappicon';

export default class Footer extends LightningElement {
    fbLogo = fb;
    instagramLogo = instagram;
    twitterLogo = twitter;
    whatsappLogo = whatsapp;

    goHome() {
    this.dispatchEvent(new CustomEvent('navigate', {
        detail: 'home'
    }));
}

goFeatured() {
    this.dispatchEvent(new CustomEvent('navigate', {
        detail: 'featured'
    }));
}

goBookings() {
    this.dispatchEvent(new CustomEvent('navigate', {
        detail: 'bookings'
    }));
}

goLogin() {
    this.dispatchEvent(new CustomEvent('navigate', {
        detail: 'login'
    }));
}
}