public without sharing class TravelPackageController {

    @AuraEnabled(cacheable=true)
    public static List<Travel_Package__c> getFeaturedPackages(){
        List<Travel_Package__c> packages = [SELECT Id, Package_Name__c,	Days__c, Location__c,Description__c, Price__c, Image_URL__c
            FROM Travel_Package__c
        
             ];
            System.debug('Fetched Packages: ' + packages);
        return packages;
    }
    @AuraEnabled(cacheable=true)
public static List<Package_Availability__c>
getPackageAvailability(Id packageId){
List<Package_Availability__c> availability = [
        SELECT Id,
               Available_Date__c,
               Available_Seats__c
        FROM Package_Availability__c
        WHERE Travel_Package__c = :packageId
        ORDER BY Available_Date__c
    ];
System.debug('Fetched Availability for package ' + packageId + ': ' + availability);
return availability;
}
    @AuraEnabled(cacheable=true)
    public static List<Travel_Package__c> getTopRatedPackages(){
        List<Travel_Package__c> packages = [SELECT Id, Package_Name__c,	Days__c, Location__c,Description__c, Price__c, Image_URL__c
            FROM Travel_Package__c
            WHERE Top_rated_packages__c = true
           
             ];
            System.debug('Fetched Top Rated Packages: ' + packages);
        return packages;
    }


    @AuraEnabled(cacheable=true)
    public static List<ContentVersion> getPackageImages(Id recordId){

        List<ContentDocumentLink> links = [
            SELECT ContentDocumentId
            FROM ContentDocumentLink
            WHERE LinkedEntityId = :recordId
        ];

        Set<Id> docIds = new Set<Id>();

        for(ContentDocumentLink link : links){
            docIds.add(link.ContentDocumentId);
        }

        return [
            SELECT Id, Title, ContentDocumentId
            FROM ContentVersion
            WHERE ContentDocumentId IN :docIds
        ];
    }

    @AuraEnabled(cacheable=true)
    public static List<Travel_Package__c> searchPackages(String keyword){
        return [
          SELECT Id, Package_Name__c, Location__c, Price__c,Description__c, Duration__c, Days__c,Image_URL__c
FROM Travel_Package__c
            WHERE Package_Name__c LIKE :('%'+keyword+'%')
            OR Location__c LIKE :('%'+keyword+'%')
        ];
    }
    @AuraEnabled
public static String createBooking(Id packageId,Date startDate,Date endDate) {
    try {
        System.debug('Just before creating booking for package: ' + packageId);
        Booking__c booking = new Booking__c();
        booking.Travel_Package__c = packageId;
               booking.Check_in__c = startDate;

        booking.Check_Out__c = endDate;
        booking.Travel_Date__c = startDate;

         System.debug('Creating booking for package: ' + booking.Travel_Package__c + ' on date: ' + booking.Travel_Date__c);
        booking.Status__c = 'Confirmed';

        insert booking;
            System.debug('Booking created with Id: ' + booking.Id);

        return 'SUCCESS';
    } catch(Exception e) {
        throw new AuraHandledException(e.getMessage());
    }
}
@AuraEnabled
public static List<Booking__c> getBookings() {
       List<Booking__c> bookings = [SELECT Id, Travel_Package__r.Package_Name__c, Travel_Date__c, Status__c
        FROM Booking__c
        ORDER BY CreatedDate DESC
    ];
    System.debug('Fetched Bookings: ' + bookings);
    return bookings;
}
@AuraEnabled
public static void deleteBooking(Id bookingId) {
    try {
        Booking__c booking = [SELECT Id FROM Booking__c WHERE Id = :bookingId LIMIT 1];
        delete booking;
    } catch(Exception e) {
        throw new AuraHandledException(e.getMessage());
    }
}
}