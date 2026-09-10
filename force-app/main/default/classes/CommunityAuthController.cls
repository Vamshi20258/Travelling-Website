public with sharing class CommunityAuthController {

    @AuraEnabled
    public static String registerUser(String firstName, String lastName, String username,
                                      String email, String communityNickname, String password) {

        try {
            

            // 🔹 1. Validate Existing User
            List<User> existingUsers = [
                SELECT Id FROM User WHERE Username = :username OR Email = :email LIMIT 1
            ];

            if (!existingUsers.isEmpty()) {
                throw new AuraHandledException('User already exists with this email/username');
            }

            // 🔹 2. Create Account (Business Account)
            Account acc = new Account(
                Name = firstName + ' ' + lastName
            );
            insert acc;
            System.debug('Account Created: ' + acc.Id);

            // 🔹 4. Generate Unique Nickname
            String uniqueNickname = generateUniqueNickname(communityNickname);

            // 🔹 5. Prepare User
            User u = new User();
            u.FirstName = firstName;
            u.LastName = lastName;
            u.Username = username;
            u.Email = email;
            u.CommunityNickname = uniqueNickname;
            // u.ContactId = con.Id;

            // 🔥 REQUIRED FIELDS
            u.Alias = (firstName + lastName).length() >= 2 
                ? (firstName + lastName).substring(0, 2) 
                : 'us';

            u.TimeZoneSidKey = 'Asia/Kolkata';
            u.LocaleSidKey = 'en_US';
            u.EmailEncodingKey = 'UTF-8';
            u.LanguageLocaleKey = 'en_US';

            // 🔥 IMPORTANT: Replace with your Customer Community Profile Id
            // u.ProfileId = getCustomerProfileId();

            // 🔹 6. Create Portal User
            String userId = Site.createPortalUser(u, acc.Id, password);
            System.debug('Portal User Created: ' + userId);
            System.debug('User Details: ' + UserInfo.getUserId() + ', ' + UserInfo.getUserName() + ', ' + UserInfo.getProfileId());

            if (userId != null) {

                // 🔹 7. Send Welcome Email
                sendWelcomeMail(userId);

                // 🔹 8. Auto Login
                if (password != null && password.length() > 0) {
                    ApexPages.PageReference pageRef = Site.login(username, password, null);
                    if (pageRef != null) {
                        return pageRef.getUrl();
                    }
                }
            }

            return null;

        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }


    // 🔹 Generate Unique Nickname
    private static String generateUniqueNickname(String baseNickname) {

        Set<String> existingNicknames = new Set<String>();

        for (User usr : [SELECT CommunityNickname FROM User WHERE CommunityNickname != null]) {
            existingNicknames.add(usr.CommunityNickname);
        }

        String nickname;
        Integer attempt = 0;

        do {
            nickname = baseNickname + String.valueOf(Math.mod(Crypto.getRandomInteger(), 10000));
            attempt++;
        } while (existingNicknames.contains(nickname) && attempt < 10);

        return nickname;
    }


    // 🔹 Get Customer Community Profile
    private static Id getCustomerProfileId() {

        Profile p = [
            SELECT Id FROM Profile 
            WHERE Name LIKE '%Travel%' 
            LIMIT 1
        ];

        return p.Id;
    }


    // 🔹 Send Welcome Email
    @AuraEnabled
    public static void sendWelcomeMail(String userId) {

        try {
            Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
           List<EmailTemplate> templates = [
        SELECT Id FROM EmailTemplate 
        WHERE DeveloperName = 'ExperienceCloudNewMemberWelcomeEmail'
        LIMIT 1
];

    if (!templates.isEmpty()) {
    mail.setTemplateId(templates[0].Id);
}

            
            mail.setTargetObjectId(userId);
            mail.setTemplateId(templates[0].Id);
            mail.setSaveAsActivity(false);

            Messaging.sendEmail(new List<Messaging.SingleEmailMessage>{mail});

        } catch (Exception e) {
            System.debug('Email Error: ' + e.getMessage());
        }
    }

    @AuraEnabled
public static String loginUser(String username, String password) {
    try {
        if (String.isBlank(username) || String.isBlank(password)) {
            throw new AuraHandledException('Username and Password are required');
        }

        ApexPages.PageReference pageRef = Site.login(username, password, null);

        if (pageRef != null) {
            return pageRef.getUrl(); // redirect URL
        } else {
            throw new AuraHandledException('Invalid username or password');
        }

    } catch (Exception e) {
        throw new AuraHandledException(e.getMessage());
    }
}
@AuraEnabled(cacheable=true)
public static Boolean isUserLoggedIn() {
    return UserInfo.getUserType() != 'Guest';
}

}