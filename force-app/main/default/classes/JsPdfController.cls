public with sharing class JsPdfController {

    @AuraEnabled
    public static void save(String recordId, String base64String, String filename) {
        try {
            Blob fileBody = EncodingUtil.base64Decode(base64String);

            ContentVersion cv = new ContentVersion(
                    Title = filename,
                    PathOnClient = filename,
                    VersionData = fileBody,
                    ContentLocation = 'S'
            );
            insert cv;

            ContentDocumentLink link = new ContentDocumentLink(
                    ContentDocumentId = [SELECT ContentDocumentId FROM ContentVersion WHERE Id = :cv.Id].ContentDocumentId,
                    LinkedEntityId = recordId,
                    ShareType = 'V'
            );
            insert link;

        } catch (Exception e) {
            throw new AuraHandledException('PDF 저장 중 오류 발생: ' + e.getMessage());
        }
    }


//    @AuraEnabled(Cacheable=true)
//    public static List<String> getFontResourceUrl(String resourceName) {
//        List<String> kNames = new List<String>{'pdf_font_bold', 'pdf_font_normal'};
//        List<StaticResource> kResources = [
//                SELECT Name, SystemModstamp
//                FROM StaticResource
//                WHERE Name IN :kNames
//                LIMIT 2
//        ];
//        List<String> kList = new List<String>();
//        for(StaticResource kResource:kResources){
//            kList.add('/resource/' + String.valueOf(((Datetime)kResource.SystemModstamp).getTime()) + '/' + kResource.Name);
//        }
//        return kList;
//    }
}