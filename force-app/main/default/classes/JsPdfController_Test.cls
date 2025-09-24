
@IsTest
private class JsPdfController_Test {

    @IsTest
    static void test01() {

        Test.startTest();

        Account testAccount = new Account(Name='Test Account');
        insert testAccount;

        JsPdfController.save(testAccount.Id, EncodingUtil.base64Encode(Blob.valueOf('dummyImageData')), 'TestFile.pdf');

        List<ContentDocumentLink> kLinks = [SELECT Id FROM ContentDocumentLink WHERE LinkedEntityId = :testAccount.Id];
        Assert.areEqual(false, kLinks.isEmpty());

        // exception test
        try{
            JsPdfController.save(null, EncodingUtil.base64Encode(Blob.valueOf('dummyImageData')), 'TestFile.pdf');
            Assert.fail();
        }catch(Exception e){
            Assert.areEqual(true, String.isNotEmpty(e.getMessage()));
        }

        Test.stopTest();
    }
}