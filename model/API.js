function API(i,t,s,basepath){
  this.invokes=[],
  this.version=t,
  this.name=i,
  this.title=s,
  this.security={},
  this.policies=[]
  this.basepath=basepath
}

module.exports=API;
