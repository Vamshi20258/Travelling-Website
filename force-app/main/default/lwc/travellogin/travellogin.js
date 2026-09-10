import { LightningElement } from 'lwc';

import loginUser from '@salesforce/apex/CommunityAuthController.loginUser';

import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';


export default class Travellogin extends NavigationMixin(LightningElement) {

    username = '';
    password = '';
    passwordType = 'password';
    iconName = 'utility:hide'; // eye icon
    // showLogin = true;
    //showRegister = false;
    errorMessage = '';



    handleChange(event) {
        const field = event.target.dataset.field;
        this[field] = event.target.value;
    }


    handleLogin() {
        console.log('Login button clicked');
        this.errorMessage = '';


        // ✅ Validate inputs
        if (!this.username || !this.password) {
            console.log('Username:', this.username);
            console.log('Password:', this.password);
            this.errorMessage = 'Please enter username and password';
            return;
        }






        // Call Apex
        loginUser({
            username: this.username,
            password: this.password
        })
            .then(result => {

                console.log('Login result:', result);

                if (result) {


                    sessionStorage.setItem('isLoggedIn', 'true');
                    // ✅ Redirect on success
                    window.location.href = result;
                } else {
                    this.errorMessage = 'Invalid username or password';
                }

            })
            .catch(error => {

                console.error(error);

                this.errorMessage = error?.body?.message || 'Login failed';
            });
    }

    togglePassword() {
        if (this.passwordType === 'password') {
            this.passwordType = 'text';
            this.iconName = 'utility:preview'; // eye-icon
        } else {
            this.passwordType = 'password';
            this.iconName = 'utility:hide'; // eye-off icon
        }

    }

    handleForgotPassword() {
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/ForgotPassword'   // OR '/s/forgotpassword' depending on your site
            }
        });

    }

    // ✅ Toast helper method
    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                message: message,
                variant: variant
            })
        );
    }

    openRegister() {
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/SelfRegister'
            }
        });

    }





}