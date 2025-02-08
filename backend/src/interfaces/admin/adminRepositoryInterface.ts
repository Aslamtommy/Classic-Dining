export interface IAdminrepository{
    findByEmail(email:string):Promise<any>
}