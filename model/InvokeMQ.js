// Copyright IBM Corp. 2017. All Rights Reserved.
// Licensed under "The MIT License (MIT)"
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
