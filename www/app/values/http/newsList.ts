export interface IReqNewsList {
    headlineId:string;
    getCount:number;
}

export interface IResNewsList {
    status:string;
    message:string;
    datetime:string;
    result:{
        newsList:NewsList[];
    };
}

export interface NewsList {
    headlineId:string;
    newsVenderName:string;
    resourceType:string;
    issueDate:string;
    title:string;
    pureStory:string;
    newsVenderCode:string;
    forFilter?:string;
}