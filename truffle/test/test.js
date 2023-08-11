const Main = artifacts.require("Main.sol");
const Session = artifacts.require("Session.sol");

let mainInstance;
let sessionInstance;
let sessionInstance2;
let contractAddress;

contract("Test contract", (accounts) => {
    let admin = accounts[0];
     describe("Contract main", () => {
        it("Contract deployment", () => {
            Main.deployed({from: admin}).then((instance) => {
                mainInstance = instance;
                contractAddress = mainInstance.address;
                assert.notEqual(mainInstance, undefined);
                assert.notEqual(contractAddress, undefined);
                assert.notEqual(contractAddress, "0x0000000000000000000000000000000000000000");
            });
        });
    
        it("Check admin is accounts[0]", () => { 
            mainInstance.getAdmin().then((result) => {
                assert.equal(result, admin);
            });
        });
    
        it("Register participants", async () => { 
            await mainInstance.register("participant 1", "participant1@gmail.com", accounts[1])
            await mainInstance.register("participant 2", "participant2@gmail.com", accounts[2])
            await mainInstance.register("participant 3", "participant3@gmail.com", accounts[3])
            return mainInstance.register("participant 4", "participant4@gmail.com", accounts[4])
            .then((result) => {
                return mainInstance.getAllParticipants();
            })
            .then((result) => {
                assert.equal(result[0].fullname, "participant 1");
                assert.equal(result[0].email, "participant1@gmail.com");
                assert.equal(result[0].account, accounts[1]);
                
                assert.equal(result[1].fullname, "participant 2");
                assert.equal(result[1].email, "participant2@gmail.com");
                assert.equal(result[1].account, accounts[2]);
                
                assert.equal(result[2].fullname, "participant 3");
                assert.equal(result[2].email, "participant3@gmail.com");
                assert.equal(result[2].account, accounts[3]);
                
                assert.equal(result[3].fullname, "participant 4");
                assert.equal(result[3].email, "participant4@gmail.com");
                assert.equal(result[3].account, accounts[4]);
            });
        });

        let maxParticipant = 4;
        it(`update max participants is ${maxParticipant}`, async () => {
            await mainInstance.updateMaxParticipant(maxParticipant);
            return mainInstance.maxParticipant()
            .then((result) => {
                assert.equal(result, maxParticipant);
            });
        });

        it(`Participants should not be allowed to register while the participant list is > ${maxParticipant}`, async () => {
            return mainInstance.register("participant 8", "participant8@gmail.com", accounts[8])
            .then(() =>{
                throw "Condition not implemented in Smart Contract";
            })
            .catch((err) => {
                if(err.toString() === "Condition not implemented in Smart Contract")
                    assert(false);
                else
                    assert(true);
            });
        });
    
        it("Update participants", async () => {
            await mainInstance.updateParticipantByIndex(0, "update participant 1", "upparticipant1@gmail.com", accounts[1], accounts[5], 1, 0), {from: admin};
            return mainInstance.updateParticipantByIndex(3, "update participant 4", "upparticipant4@gmail.com", accounts[2], accounts[6], 0, 0, {from: admin})
            .then((result) => {
                return mainInstance.participants(accounts[5], {from: admin});
            })
            .then((result) => { 
                assert.equal(result.fullname, "update participant 1");
                assert.equal(result.email, "upparticipant1@gmail.com");
                assert.equal(result.nSessions, 1);
            })
            .then((result) => {
                return mainInstance.participants(accounts[6], {from: admin});
            })
            .then((result) => { 
                assert.equal(result.fullname, "update participant 4");
                assert.equal(result.email, "upparticipant4@gmail.com");
                assert.equal(result.nSessions, 0);
            });
        });
     });

     describe("Contract Session", () => {
        it("Create session", () => {
            return Session.new(contractAddress, "Laptop asus", "Laptop", "http://localhost/asus.png")
            .then((instance) => {
                sessionInstance = instance
                assert.notEqual(sessionInstance, undefined);
            })
            .then(() => {
                return Session.new(contractAddress, "iphone 14", "iphone", "http://localhost/iphone.png");
            })
            .then((instance) => {
                sessionInstance2 = instance;
                assert.notEqual(sessionInstance, undefined);
            })
            .catch((err) => {
                assert(false);
            })
        });
        
        it("Check product", () => {
            return sessionInstance.getProduct()
            .then((result) => { 
                assert.equal(result.name, "Laptop asus");
                assert.equal(result.description, "Laptop");
                assert.equal(result.image, "http://localhost/asus.png");        
            })
            .then(() => {
                return sessionInstance2.getProduct()
            })
            .then((result) => { 
                assert.equal(result.name, "iphone 14");
                assert.equal(result.description, "iphone");
                assert.equal(result.image, "http://localhost/iphone.png");        
            })
        });

        it("Update product", () => {
            return sessionInstance.updateSession("Laptop dell", "laptop",  "http://localhost/dell.png")
            .then((result) => {
                return sessionInstance.getProduct();
            })
            .then((result) => {
                assert.equal(result.name, "Laptop dell");
                assert.equal(result.description, "laptop");
                assert.equal(result.image, "http://localhost/dell.png");        
            });
        });

        it("Participants should not be allowed to bid until the session has started", () => {
            return sessionInstance.setProposedPrice(accounts[5], 22000)
            .then((result) => {
                throw "Condition not implemented in Smart Contract";
            })
            .catch((err) => {
                if(err.toString() === "Condition not implemented in Smart Contract")
                    assert(false);
                else
                    assert(true);
            })
        });

        it("Start pricing session", () => {
            const start = "1";
            return sessionInstance.startPricingSession({from: admin})
            .then(async (result) => {
                result = await sessionInstance.getProduct();
                assert(result.state === start);
            })
            .then(() => {
                return sessionInstance2.startPricingSession({from: admin})
            })
            .then(async (result) => {
                result = await sessionInstance2.getProduct();
                assert(result.state === start);
            })
        });

        it("Participants set price", async () => {
            let proposedPrice1, proposedPrice2, proposedPrice3;
            await sessionInstance.setProposedPrice(accounts[2], 25000); // participant 2   
            proposedPrice2 = await sessionInstance.getProduct();
            proposedPrice2 = proposedPrice2.proposedPrice;
            
            await sessionInstance.setProposedPrice(accounts[3], 14000); // participant 3
            proposedPrice3 = await sessionInstance.getProduct();
            proposedPrice3 = proposedPrice3.proposedPrice;
            
            await sessionInstance.setProposedPrice(accounts[5], 22000) // participant 1
            proposedPrice1 = await sessionInstance.getProduct()
            proposedPrice1 = proposedPrice1.proposedPrice;

            return sessionInstance.getAllParticipantsOfSession()
            .then((result) => {
                assert.equal(result.length, 3);

                assert.equal(proposedPrice2, 25000);
                assert.equal(result[0].account, accounts[2]); // nSessions = 0, // deviation = 0
                assert.equal(result[0].price, 25000); 
                
                assert.equal(proposedPrice3, 19500)
                assert.equal(result[1].account, accounts[3]); // nSessions = 0, // deviation = 0
                assert.equal(result[1].price, 14000);
                
                assert.equal(proposedPrice1, 20333)
                assert.equal(result[2].account, accounts[5]); // nSessions = 1, // deviation = 0
                assert.equal(result[2].price, 22000); 
            });
        });

        it("Should not allow unregistered people to participate in product pricing", () => {
            return sessionInstance.setProposedPrice(accounts[8], 12000)
            .then((result) => { 
                throw "Condition not implemented in Smart Contract";
            })
            .catch((error) => {
                if(error.toString() === "Condition not implemented in Smart Contract")
                    assert(false);
                else
                    assert(true);
            });
        })

        it("Should not allow participant set price while over timeout", () => {
            return sessionInstance.setTimeout(2) //2s
            .then((result) => {
                return new Promise((resolve, reject) => {
                    setTimeout(async () => {
                        let data = await sessionInstance.setProposedPrice(accounts[5], 12000);
                        resolve(data);
                    }, 2500);
                }).then((data) => {
                    return sessionInstance.getAllParticipantsOfSession()
                    .then((result) => {
                        assert.equal(result[2].account, accounts[5]);
                        assert.notEqual(Number(result[2].price), 12000);
                    });
                });
            });
        });

        it("Set final price", () => {
            const finalPrice = 17000;
            return sessionInstance.setFinalPrice(finalPrice, {from: admin})
            .then(async (result) => {
                result = await sessionInstance.getProduct();
                assert.equal(result.finalPrice, finalPrice);
            })
            .then(() => {
                return sessionInstance.getAllParticipantsOfSession();
            })
            .then(async (result) => {
                // participant 2
                assert.equal(result[0].account, accounts[2]); // nSessions = 0,
                assert.equal(result[0].deviation / 100, 0.47);
                // accumulated deviation of participant 2
                let pariticipant2 = await mainInstance.participants(accounts[2]);
                assert.equal(pariticipant2.deviation / 100, 0.23);
                
                // participant 3
                assert.equal(result[1].account, accounts[3]); // nSessions = 0
                assert.equal(result[1].deviation / 100, 0.17);
                // accumulated deviation of participant 3
                let pariticipant3 = await mainInstance.participants(accounts[3]);
                assert.equal(pariticipant3.deviation / 100, 0.08);
                
                // participant 1
                assert.equal(result[2].account, accounts[5]); // nSessions = 1
                assert.equal(result[2].deviation / 100, 0.29);
                // accumulated deviation of participant 1
                let pariticipant1 = await mainInstance.participants(accounts[5]);
                assert.equal(pariticipant1.deviation / 100, 0.09);
            });
        });

        it("Get participant winner", () => {
            return sessionInstance.getParticipantWinner({from: admin})
            .then((result) => {
                assert.equal(result.account, accounts[3]);
            });
        });

        it("Participants set price of session 2", async () => {
            let proposedPrice1, proposedPrice3;
            await sessionInstance2.setProposedPrice(accounts[3], 55500); // participant 3
            proposedPrice3 = await sessionInstance2.getProduct();
            proposedPrice3 = proposedPrice3.proposedPrice;
            
            await sessionInstance2.setProposedPrice(accounts[5], 66000) // participant 1
            proposedPrice1 = await sessionInstance2.getProduct()
            proposedPrice1 = proposedPrice1.proposedPrice;

            return sessionInstance2.getAllParticipantsOfSession()
            .then((result) => {
                assert.equal(result.length, 2);

                assert.equal(proposedPrice3, 55500)
                assert.equal(result[0].account, accounts[3]); // nSessions = 2, // deviation = 0.08
                assert.equal(result[0].price, 55500);
                
                assert.equal(proposedPrice1, 60721)
                assert.equal(result[1].account, accounts[5]); // nSessions = 3, // deviation = 0.09
                assert.equal(result[1].price, 66000); 
            });
        });

        it("Stop pricing session 2", () => {
            const stop = "2";
            return sessionInstance2.stopPricingSession({from: admin})
            .then(async (result) => {
                result = await sessionInstance2.getProduct();
                assert(result.state === stop);
            })
        });

        it("Set final price", () => {
            const finalPrice = 62500;
            return sessionInstance2.setFinalPrice(finalPrice, {from: admin})
            .then(async (result) => {
                result = await sessionInstance2.getProduct();
                assert.equal(result.finalPrice, finalPrice);
            })
            .then(() => {
                return sessionInstance2.getAllParticipantsOfSession();
            })
            .then(async (result) => {
                // participant 3
                assert.equal(result[0].account, accounts[3]); // nSessions = 2
                assert.equal(result[0].deviation / 100, 0.11);
                // accumulated deviation of participant 3
                let pariticipant3 = await mainInstance.participants(accounts[3]);
                assert.equal(pariticipant3.deviation / 100, 0.09);
                
                // participant 1
                assert.equal(result[1].account, accounts[5]); // nSessions = 3
                assert.equal(result[1].deviation / 100, 0.05);
                // accumulated deviation of participant 1
                let pariticipant1 = await mainInstance.participants(accounts[5]);
                assert.equal(pariticipant1.deviation / 100, 0.08);
            });
        });

        it("Get participant winner", () => {
            return sessionInstance2.getParticipantWinner({from: admin})
            .then((result) => {
                assert.equal(result.account, accounts[5]);
            });
        });
    });
});