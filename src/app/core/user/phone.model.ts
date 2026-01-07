export class Phone {
    id?: number;
    number: string = '';
    type: string = 'mobile';
    
    constructor(init?: Partial<Phone>) {
      Object.assign(this, init);
    }
  }