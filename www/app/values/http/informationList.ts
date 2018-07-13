export interface IReqInformationList {
}

export interface IResInformationList {
    status:string;
    message:string;
    datetime:string;
    result:{
        informationListForAll:informationListForAll[];
        InformationListForClient:InformationListForClient[];
    };
}

interface informationListForAll {
    title:string;
    startupDatetime:string;
    seqno:string;
    importantLevel:string;
}

interface InformationListForClient {
    title:string;
    startupDatetime:string;
    seqno:string;
    importantLevel:string;
    checkFlag:string;
}