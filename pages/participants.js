import { app, h } from 'hyperapp';
import './participants.css';

const Fragment = (props, children) => children;

const showModal = (data) => {
  setCurrentParticipant(data);
  $("#modalParticipant").modal('show'); 
}

const ParticipantRow = ({participant, select, index}) => (
  <tr class='participant'>
    <td scope='row' class='text-center'>
      <img
        class='img-avatar img-thumbnail'
        src={'https://robohash.org/' + participant.account}
      ></img>
    </td>
    <td scope='row' class='align-middle'>
      {participant.fullname}
    </td>
    <td scope='row' class='align-middle'>
      {participant.email}
    </td>
    <td scope='row' class='align-middle text-center'>
      {participant.nSessions}
    </td>
    <td scope='row' class='align-middle text-center'>
      {participant.deviation / 100} %
    </td>
    <td scope='row' class='align-middle text-center'>
      <code>{participant.account}</code>
    </td>
    <td scope='row' class='align-middle text-center'>
      <button class="btn btn-outline-primary" type="button"
        onclick={(e) => {
          select(index);
          showModal(participant);
        }}
      >Update</button>
    </td>
  </tr>
);

const Participants = ({ match }) => ({ participants, currentParticipantIndex }
  , {selectParticipant, updateParticipant}) => {
  
  return (
    <div class='d-flex w-100 h-100 bg-white'>
      <div class='products-list'>
        <table class='table table-hover table-striped'>
          <thead>
            <tr>
              <th scope='col' class='text-center'></th>
              <th scope='col'>Fullname</th>
              <th scope='col'>Email</th>
              <th scope='col' class='text-center'>
                Number of sessions
              </th>
              <th scope='col' class='text-center'>
                Deviation
              </th>
              <th scope='col' class='text-center'>
                Address
              </th>
              <th scope='col' class='text-center'>
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {(participants || []).map((p, i) => {
              return (<ParticipantRow 
                participant={p}
                select={selectParticipant}
                index={i}
              ></ParticipantRow>)
            })}
          </tbody>
        </table>
      </div>
      {participants.length > 0 ? (
        <ModalData 
          participant={participants[currentParticipantIndex]}
          update={updateParticipant}>
        </ModalData>
      ) : (
        <></>
      )}
    </div>
  )
}

let profileParticipant = {};

const setCurrentParticipant = (participant) => {
  profileParticipant = {...participant};
}

const inputParticipant = ({ field, value }) => {
  profileParticipant[field] = value;
}

const ModalData = ({participant, update}) => {
  return (
    <>
      <div class="modal" id="modalParticipant">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                Update participant {participant.fullname}
              </h5>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div class="modal-body">
              <div class="row">
                <div class="col-sm-12 col-md-6">
                  <div class="form-group">
                    <label for="name">Fullname</label>
                    <input
                      type="text"
                      class="form-control"
                      id="name"
                      value={participant.fullname}
                      oninput={(e) => {
                        inputParticipant({
                          field: "fullname",
                          value: e.target.value,
                        });
                      }}
                    />
                  </div>
                </div>
                <div class="col-sm-12 col-md-6">
                  <div class="form-group">
                    <label for="name">Email</label>
                    <input
                      type="text"
                      class="form-control"
                      id="email"
                      value={participant.email}
                      oninput={(e) => {
                        inputParticipant({
                          field: "email",
                          value: e.target.value,
                        });
                      }}
                    />
                  </div>
                </div>
                <div class="col-sm-12 col-md-6">
                  <div class="form-group">
                    <label for="name">Number of session</label>
                    <input
                      type="text"
                      class="form-control"
                      id="nSessions"
                      value={participant.nSessions}
                      oninput={(e) => {
                        inputParticipant({
                          field: "nSessions",
                          value: e.target.value,
                        });
                      }}
                    />
                  </div>
                </div>
                <div class="col-sm-12 col-md-6">
                  <div class="form-group">
                    <label for="name">Deviation</label>
                    <input
                      type="text"
                      class="form-control"
                      id="deviation"
                      value={participant.deviation / 100}
                      oninput={(e) => {
                        inputParticipant({
                          field: "deviation",
                          value: e.target.value,
                        });
                      }}
                    />
                  </div>
                </div>
                <div class="col-sm-12">
                  <div class="form-group">
                    <label for="name">Account</label>
                    <input
                      type="text"
                      class="form-control"
                      id="accountNew"
                      value={participant.account}
                      oninput={(e) => {
                        inputParticipant({
                          field: "accountNew",
                          value: e.target.value,
                        });
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
              <button type="submit" class="btn btn-primary"
              onclick={(e) => {
                update(profileParticipant);
              }}>
                Update
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export { Participants };
