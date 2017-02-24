/*
      Licensed Materials - Property of IBM
      © IBM Corp. 2016
*/
function InvokeMQ(QM, Q) {
	this.qm=QM;
	this.type = "mq";
	this.q=Q;
}
module.exports = InvokeMQ;
