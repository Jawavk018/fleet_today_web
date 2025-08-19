
import { BaseModel } from "src/app/models/base.model";

export class Menu implements BaseModel{
    constructor(public appMenuSno: number,
                public title: string,
                public routerLink: string,
                public href: string,
                public icon: string,
                public target: string,
                public hasSubMenu: boolean,
                public parentMenuSno: number) { }
} 