import { app, h } from "hyperapp";
import { Link } from "@hyperapp/router";

const Fragment = (props, children) => children;

const Profile = ({ profile, register, inputProfile, isAdmin }) => {
  let newProfile = {};
  const hasProfile = profile && profile.nSessions > 0;
  profile = profile || {};
  if (!isAdmin) {
    return (
      <>
        <li class="nav-title">{hasProfile ? "Profile" : "Register"}</li>
        <li class="nav-item px-3 mb-2">
          <div>
            <small class="text-muted">
              <b>Fullname</b>
            </small>
          </div>
          <input
            class="form-control form-control-sm"
            type="text"
            value={profile.fullname || ""}
            oninput={(e) => {
              inputProfile({ field: "fullname", value: e.target.value });
            }}
          ></input>
        </li>
        <li class="nav-item px-3 mb-2">
          <div>
            <small class="text-muted">
              <b>Email</b>
            </small>
          </div>
          <input
            class="form-control form-control-sm"
            type="email"
            value={profile.email || ""}
            oninput={(e) => {
              inputProfile({ field: "email", value: e.target.value });
            }}
          ></input>
        </li>
        {hasProfile ? (
          <>
            <li class="nav-item px-3 d-compact-none d-minimized-none mb-2">
              <div>
                <small class="text-muted">
                  <b>Number of sessions</b>
                </small>
              </div>
              <small>{profile.nSessions} session(s)</small>
            </li>
            <li class="nav-item px-3 d-compact-none d-minimized-none mb-2">
              <div>
                <small class="text-muted">
                  <b>Accuracy</b>
                </small>
              </div>
              <small>{profile.deviation / 100}%</small>
            </li>
          </>
        ) : <></>
        }
        <li class="nav-item px-3 mb-2">
          <button
            class="btn  btn-sm btn-ghost-primary btn-block "
            type="button"
            onclick={register}
          >
            {hasProfile ? "Update" : "Register"}
          </button>
        </li>
      </>
    );
  }
};

const Account = ({ account, balance, isAdmin }) => {
  return account ? (
    <div class="sidebar-header">
      <img
        class="img-avatar img-thumbnail"
        src={"https://robohash.org/" + account}
      ></img>
      <div class="balance">{balance / 1000000000000000000} ETH</div>
      {isAdmin ? (
        <h4>
          <span class="badge badge-pill badge-primary">Administrator</span>
        </h4>
      ) : (
        <h4>
          <span class="badge badge-pill badge-secondary">Member</span>
        </h4>
      )}
      <div class="account">{account}</div>
    </div>
  ) : (
    <div></div>
  );
};

const Sidebar = ({
  account,
  balance,
  isAdmin,
  profile,
  register,
  inputProfile,
}) => {
  return (
    <div class="sidebar">
      <Account
        account={account}
        balance={balance}
        isAdmin={isAdmin}
        profile={profile}
      ></Account>
      <nav class="sidebar-nav">
        <ul class="nav">
          <Profile
            profile={profile}
            register={register}
            inputProfile={inputProfile}
            isAdmin={isAdmin}
          ></Profile>
          <li class="nav-divider"></li>
          <li class="nav-title">View all</li>
          <li class="nav-item">
            <Link class="nav-link" to="/products">
              <i class="nav-icon cui-balance-scale"></i> Products
            </Link>
          </li>
          {isAdmin ? (
            <li class="nav-item">
              <Link class="nav-link" to="/participants">
                <i class="nav-icon cui-people"></i> Participants
              </Link>
            </li>
          ) : <></>}
        </ul>
      </nav>
    </div>
  );
};

export { Sidebar };
