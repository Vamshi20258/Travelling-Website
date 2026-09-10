// import { LightningElement, track } from 'lwc';
// import registerUser from '@salesforce/apex/CommunityAuthController.registerUser';
// import { NavigationMixin } from 'lightning/navigation';
// import { ShowToastEvent } from 'lightning/platformShowToastEvent';

// export default class RegistrationComponent extends NavigationMixin(LightningElement) {
//     firstName = '';
//     lastName = '';
//     email = '';
//     username = '';
//     communityNickname = '';
//     password = '';
//     passwordType = 'password';
//     iconName = 'utility:hide'; // eye icon

//     showRegister = true;



//     handleChange(event) {
//         const field = event.target.dataset.field;
//         console.log('Updating field:', field, 'with value:', event.target.value);
//         this[field] = event.target.value;
//     }

//     togglePassword() {
//         if (this.passwordType === 'password') {
//             this.passwordType = 'text';
//             this.iconName = 'utility:preview'; // eye-icon
//         } else {
//             this.passwordType = 'password';
//             this.iconName = 'utility:hide'; // eye-off icon
//         }
//     }

//     handleRegister() {
//           let isValid = true;

//     const inputs = this.template.querySelectorAll('.validate');

//     inputs.forEach(input => {
//         // Clear previous error
//         input.setCustomValidity('');

//         // Check if empty
//         if (!input.value) {
//             input.setCustomValidity(`Please enter ${input.label}`);
//             isValid = false;
//         }

//         // Show error
//         input.reportValidity();
//     });

//     if (!isValid) {
//         return;
//     }

//     // Proceed if all valid
//     console.log('All fields valid');
//         console.log(
//             'Registering user with details:',
//             JSON.stringify({
//                 firstName: this.firstName,
//                 lastName: this.lastName,
//                 username: this.username,
//                 email: this.email,
//                 communityNickname: this.communityNickname,
//                 password: this.password
//             })


//         );
//         registerUser({
//             firstName: this.firstName,
//             lastName: this.lastName,
//             username: this.username,
//             email: this.email,
//             communityNickname: this.communityNickname,
//             password: this.password
//         })
//             .then(result => {

//                 // ✅ Show success toast ONLY on success
//                 this.dispatchEvent(
//                     new ShowToastEvent({
//                         title: 'Success',
//                         message: 'Account created. Please check your email to set your password.',
//                         variant: 'success'
//                     })
//                 );

//                 // ✅ Redirect to login page
//                 this.openLogin();

//             })
//             .catch(error => {

//                 console.error(error);

//                 // ❌ Show error properly
//                 this.dispatchEvent(
//                     new ShowToastEvent({
//                         title: 'Error',
//                         message: error?.body?.message || 'Something went wrong',
//                         variant: 'error'
//                     })
//                 );

//             });
//         this.showRegister = false;
//     }

//     openLogin() {
//         this[NavigationMixin.Navigate]({
//             type: 'standard__webPage',
//             attributes: {
//                 url: '/login'   // OR '/s/login' depending on your site
//             }
//         });
//     }
// }

import { LightningElement, track } from 'lwc';
import registerUser from '@salesforce/apex/CommunityAuthController.registerUser';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class RegistrationComponent extends NavigationMixin(LightningElement) {
firstName = '';
lastName = '';
email = '';
username = '';
communityNickname = '';
password = '';
passwordType = 'password';
iconName = 'utility:hide';


showRegister = true;

handleChange(event) {
    const field = event.target.dataset.field;
    this[field] = event.target.value;
}

togglePassword() {
    if (this.passwordType === 'password') {
        this.passwordType = 'text';
        this.iconName = 'utility:preview';
    } else {
        this.passwordType = 'password';
        this.iconName = 'utility:hide';
    }
}

// 🔥 Password Validation Function
validatePassword(password) {
    if (!password) {
        return 'Please enter Password';
    }

    if (password.length < 8) {
        return 'Password must be at least 8 characters';
    }

    if (!/[A-Z]/.test(password)) {
        return 'Password must include at least one uppercase letter';
    }

    if (!/[a-z]/.test(password)) {
        return 'Password must include at least one lowercase letter';
    }

    if (!/[0-9]/.test(password)) {
        return 'Password must include at least one number';
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return 'Password must include at least one special character';
    }

    return '';
}

handleRegister() {
    let isValid = true;

    // 🔥 General Field Validation
    const inputs = this.template.querySelectorAll('.validate');

    inputs.forEach(input => {
        input.setCustomValidity('');

        let label = input.label || 'Password';

        if (!input.value) {
            input.setCustomValidity(`Please enter ${label}`);
            isValid = false;
        }

        input.reportValidity();
    });

    // 🔥 Password Validation
    const passwordInput = this.template.querySelector('.password-input');
    const passwordError = this.validatePassword(this.password);

    if (passwordError) {
        passwordInput.setCustomValidity(passwordError);
        passwordInput.reportValidity();
        isValid = false;
    } else {
        passwordInput.setCustomValidity('');
        passwordInput.reportValidity();
    }

    // 🚫 Stop if validation fails
    if (!isValid) {
        return;
    }

    console.log('All validations passed');

    registerUser({
        firstName: this.firstName,
        lastName: this.lastName,
        username: this.username,
        email: this.email,
        communityNickname: this.communityNickname,
        password: this.password
    })
    .then(result => {

        // ✅ Show success toast
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success',
                message: 'Account created. Please check your email to set your password.',
                variant: 'success'
            })
        );

        // ✅ Hide register screen ONLY on success
        this.showRegister = false;

        // ✅ Navigate to login page
        this.openLogin();
    })
    .catch(error => {
        console.error(error);

        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Error',
                message: error?.body?.message || 'Something went wrong',
                variant: 'error'
            })
        );
    });
}

openLogin() {
    this[NavigationMixin.Navigate]({
        type: 'standard__webPage',
        attributes: {
            url: '/login'
        }
    });
}


}