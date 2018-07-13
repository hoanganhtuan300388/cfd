
/**
 * Stack
 */
export class Stack<T>{
  protected stack:Array<T> = [];
  constructor(){
    
  }
  public push(v:T){
    this.stack.push(v);
  }
  public pop():T{
    return this.stack.pop();
  }
  public look():T{
    var r=this.stack[this.stack.length-1];
    return r;
  }
  public clear(){
    this.stack=[];
  }
}