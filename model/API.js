function API(i,t,s){
  this.invokes=[],
  this.version=t,
  this.name=i,
  this.title=s,
  this.security={},
  this.policies=[]
}

module.exports=API;
