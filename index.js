import { app, h } from "hyperapp";
import { Link, Route, location } from "@hyperapp/router";
import { Products } from "./pages/products";
import { Sidebar } from "./pages/sidebar";
import { Participants } from "./pages/participants";
import { config } from "./config";
import { promisify } from "util";
import "./css/vendor/bootstrap.css";
import "./css/vendor/coreui.css";
import "./css/index.css";

const Fragment = (props, children) => children;

const Web3 = require("web3");
let web3js;

if (typeof web3 !== "undefined") {
  web3js = new Web3(web3.currentProvider);
} else {
  web3js = new Web3("ws://localhost:7545");
}

import Main from "./contracts/Main.json";
import Session from "./contracts/Session.json";

const mainContract = new web3js.eth.Contract(Main.abi, config.mainContract);

var state = {
  count: 1,
  location: location.state,
  products: [],
  dapp: {},
  balance: 0,
  account: 0,
  admin: null,
  profile: null,
  fullname: "",
  email: "".replace,
  newProduct: {},
  sessions: [],
  participants: [],
  currentProductIndex: 0,
  currentParticipantIndex: 0,
  price: 0,
  product: {},
};

// Functions of Main Contract
const contractFunctions = {
  getAccounts: promisify(web3js.eth.getAccounts),
  getBalance: promisify(web3js.eth.getBalance),

  // TODO: The methods' name is for referenced. Update to match with your Main contract

  // Get Admin address of Main contract
  admin: mainContract.methods.admin().call,

  // Get participant by address
  participants: async (address) => await mainContract.methods.participants(address).call({from: await contractFunctions.admin()}),

  getAllParticipants: async () => await mainContract.methods.getAllParticipants().call({from: await contractFunctions.admin()}),

  // Get number of participants
  nParticipants: mainContract.methods.nParticipants().call,

  // Get address of participant by index (use to loop through the list of participants)
  iParticipants: async (index) => await mainContract.methods._iParticipants(index).call(),

  // Register new participant
  register: async (fullname, email, account) => {
    await mainContract.methods.register(fullname, email, account).send({
      from: account
    }).then((result) => {
      alert('success');
    }).catch((err) => {
      alert(err.message);
    });
  },

  // Get number of sessions
  nSessions: async () => await mainContract.methods.getNumberSession().call(),

  // Get address of session by index (use to loop through the list of sessions)
  sessions: async (index) => await mainContract.methods.sessions(index).call(),
};

const actions = {
  inputProfile:
    ({ field, value }) =>
    (state) => {
      let profile = state.profile || {};
      profile[field] = value;
      return {
        ...state,
        profile,
      };
    },

  inputNewProduct: ({ field, value }) => (state) => {
    let newProduct = state.newProduct || {};
    newProduct[field] = value;
    return {
      ...state,
      newProduct,
    };
  },

  createProduct: () => async (state, actions) => {
    let contract = new web3js.eth.Contract(Session.abi, {
      data: Session.bytecode,
    });

    await contract
      .deploy({
        arguments: [
          // TODO: Argurment when Deploy the Session Contract
          // It must be matched with Session.sol Contract Constructor
          // Hint: You can get data from `state`
          config.mainContract,
          state.newProduct.name, state.newProduct.description, state.newProduct.image
        ],
      })
      .send({ from: state.account });

    actions.getSessions();
  },

  inputProductDetail: ({ field, value }) => (state) => {
    let product = state.product || {};
    product[field] = value;
    product.name ? state.sessions[state.currentProductIndex].name = product.name : '';
    product.description ? state.sessions[state.currentProductIndex].description = product.description : '';
    product.image ? state.sessions[state.currentProductIndex].image = product.image : '';
    return {
      ...state,
      product,
    };
  },

  updateProduct: () => async (state, actions) => {
    const session = state.sessions[state.currentProductIndex];
    let contract = new web3js.eth.Contract(Session.abi, session.id);

    await contract.methods.updateSession(session.name, session.description, session.image)
    .send({from: state.account})
    .on('receipt', () => {
      alert("Success");
    })
    .on('error', (err) => {
      alert("Fail");
    });
  },

  selectProduct: (i) => (state) => {
    return {
      currentProductIndex: i,
    };
  },

  selectParticipant: (i) => (state) => {
    return {
      currentParticipantIndex: i,
    };
  },

  updateParticipant: (participant) => async (state, actions) => {
    await mainContract.methods.updateParticipantByIndex(state.currentParticipantIndex, participant.fullname
      , participant.email, participant.account, participant.accountNew, participant.deviation, participant.nSessions)
    .send({from: state.account})
    .on('receipt', () => {
      alert("Success");
    })
    .on('error', (err) => {
      alert("Fail");
    });
  },

  sessionFn: (data) => async (state) => {
      const session = state.sessions[state.currentProductIndex].id;
      let contract = new web3js.eth.Contract(Session.abi, session);

      switch (data.action) {
        case "start":
          //TODO: Handle event when User Start a new session
          await contract.methods.startPricingSession()
          .send({from: state.account})
          .on('receipt', (data) => {
            alert('success');
          })
          .on('error', (error) => {
            alert(error.message);
          });
          
          break;
        case "stop":
          //TODO: Handle event when User Stop a session
          await contract.methods.stopPricingSession()
          .send({from: state.account})
          .on('receipt', (data) => {
            alert('success');
          })
          .on('error', (error) => {
            alert(error.message);
          });

          break;
        case "pricing":
          //TODO: Handle event when User Pricing a product
          //The inputed Price is stored in `data`
          await contract.methods.setFinalPrice(data.price)
          .send({from: state.account})
          .on('receipt', (data) => {
            alert('success');
          })
          .on('error', (error) => {
            alert(error.message);
          });

          break;
        // case "close":
        //   //TODO: Handle event when User Close a session
        //   //The inputed Price is stored in `data`

        //   break;
      }
    },

  setProposedPrice: (price) => async (state) => {
    const session = state.sessions[state.currentProductIndex].id;
    let contract = new web3js.eth.Contract(Session.abi, session);
    await contract.methods.setProposedPrice(state.account, price)
    .send({from: state.account})
    .on('receipt', (data) => {
      console.log(data);
      alert('success');
    })
    .on('error', (error) => {
      alert(error.message);
    });
  },

  setTimeout: (timeout) => async (state) => {
    const session = state.sessions[state.currentProductIndex].id;
    let contract = new web3js.eth.Contract(Session.abi, session);
    await contract.methods.setTimeout(timeout).send({
      from: state.account
    }).then(() => {
      alert('success')
    }).catch((err) => {
      alert(err.message);
    });
  },

  location: location.actions,

  getAccount: () => async (state, actions) => {
    let accounts = await contractFunctions.getAccounts();
    let balance = await contractFunctions.getBalance(accounts[0]);
    let admin = await contractFunctions.admin();
    let profile = await contractFunctions.participants(accounts[0]);
    actions.setAccount({
      account: accounts[0],
      balance,
      isAdmin: admin === accounts[0],
      profile,
    });
  },

  setAccount: ({ account, balance, isAdmin, profile }) => (state) => {
      return {
        ...state,
        account: account,
        balance: balance,
        isAdmin: isAdmin,
        profile,
      };
    },

  getParticipants: () => async (state, actions) => {
    let participants = [];
    // TODO: Load all participants from Main contract.
    // One participant should contain { address, fullname, email, nSession and deviation }
    participants = await contractFunctions.getAllParticipants();

    actions.setParticipants(participants); 
  },

  setParticipants: (participants) => (state) => {
    return {
      ...state,
      participants: participants,
    };
  },

  setProfile: (profile) => (state) => {
    return {
      ...state,
      profile: profile,
    };
  },

  register: () => async (state, actions) => {
    // TODO: Register new participant
    await contractFunctions.register(
      state.profile.fullname,
      state.profile.email,
      state.account
    );
    const profile = {};
    // TODO: And get back the information of created participant
    profile.fullname = state.profile.fullname;
    profile.email = state.profile.email;
    actions.setProfile(profile);
  },

  getSessions: () => async (state, actions) => {
    let accounts = await contractFunctions.getAccounts();
    let admin = await contractFunctions.admin();
    const isAdmin = admin === accounts[0];

    // TODO: Get the number of Sessions stored in Main contract
    let nSession = await contractFunctions.nSessions();
    let sessions = [];
    let lsParticipant = [];

    // TODO: And loop through all sessions to get information

    for (let index = 0; index < nSession; index++) {
      // Get session address
      let session = await contractFunctions.sessions(index);
      // Load the session contract on network
      let contract = new web3js.eth.Contract(Session.abi, session);

      let id = session;

      // TODO: Load information of session.
      // Hint: - Call methods of Session contract to reveal all nessesary information
      //       - Use `await` to wait the response of contract
      
      let infoSession = await contract.methods.getProduct().call();
      let name = infoSession.name ?? ""; // TODO
      let description = infoSession.description ?? ""; // TODO
      let price = infoSession.proposedPrice ?? 0; // TODO
      let image = infoSession.image ?? ""; // TODO
      let finalPrice = infoSession.finalPrice ?? ""; // TODO
      let status = actions.getTextStatus(Number(infoSession.state)) ?? ""; // TODO

      let participantWinner= {};
      
      let participantsOfSession = [];
      
      if(isAdmin) {
        if(status === "Close") {
          participantWinner = await contract.methods.getParticipantWinner().call({from: admin});
        }
        lsParticipant = await contract.methods.getAllParticipantsOfSession().call({from: admin});
        if(lsParticipant.length > 0) {
          lsParticipant.map(async (participant, i) => {
            let data = await contractFunctions.participants(participant.account);
            let newParticipant = {
              account: participant.account,
              fullname: data.fullname,
              price: participant.price,
              deviation: participant.deviation / 100
            };
            participantsOfSession.push(newParticipant);
          });
        }
        sessions.push({ id, name, description, price, contract, image, finalPrice, status, participantsOfSession, participantWinner });
      }
      else if (status === "Start") 
        sessions.push({ id, name, description, price, contract, image, finalPrice, status, participantsOfSession, participantWinner });
    }
    actions.setSessions(sessions);
  },

  setSessions: (sessions) => (state) => {
    return {
      ...state,
      sessions: sessions,
    };
  },

  getTextStatus: (status) => {
    switch (status) {
      case 0:
        return "Init";
      case 1:
        return "Start";
      case 2:
        return "Stop";
      case 3: 
        return "Pricing";
      case 4:
        return "Close";
    }
  }
};

const view = (
  state,
  { getAccount, getParticipants, register, inputProfile, getSessions }
) => {
  return (
    <body
      class="app sidebar-show sidebar-fixed"
      oncreate={() => {
        getAccount();
        getSessions();
        getParticipants();
      }}
    >
      <div class="app-body">
        <Sidebar
          balance={state.balance}
          account={state.account}
          isAdmin={state.isAdmin}
          profile={state.profile}
          register={register}
          inputProfile={inputProfile}
        ></Sidebar>
        <main class="main d-flex p-3">
          <div class="h-100 w-100">
            <Route path="/products" render={Products}></Route>
            {state.isAdmin ?
              (
                <Route path="/participants" render={Participants}></Route>
              ) : <></>
            }
          </div>
        </main>
      </div>
    </body>
  );
};

const el = document.body;
const main = app(state, actions, view, el);
const unsubscribe = location.subscribe(main.location);
