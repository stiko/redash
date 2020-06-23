import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";

import routeWithUserSession from "@/components/ApplicationArea/routeWithUserSession";
import EmailSettingsWarning from "@/components/EmailSettingsWarning";
import LoadingState from "@/components/items-list/components/LoadingState";
import wrapSettingsTab from "@/components/SettingsWrapper";

import User from "@/services/user";
import { currentUser } from "@/services/auth";

import UserEdit from "./components/UserEdit";
import UserShow from "./components/UserShow";

import "./settings.less";

function UserProfile({ userId, onError }) {
  const [user, setUser] = useState(null);

  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  useEffect(() => {
    let isCancelled = false;
    User.get({ id: userId || currentUser.id })
      .then(user => {
        if (!isCancelled) {
          setUser(User.convertUserInfo(user));
        }
      })
      .catch(error => {
        if (!isCancelled) {
          onErrorRef.current(error);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [userId]);

  const canEdit = user && (currentUser.isAdmin || currentUser.id === user.id);
  const UserComponent = canEdit ? UserEdit : UserShow;
  return (
    <React.Fragment>
      <EmailSettingsWarning featureName="invite emails" className="m-b-20" adminOnly />
      <div className="row">{user ? <UserComponent user={user} /> : <LoadingState className="" />}</div>
    </React.Fragment>
  );
}

UserProfile.propTypes = {
  userId: PropTypes.string,
  onError: PropTypes.func,
};

UserProfile.defaultProps = {
  userId: null, // defaults to `currentUser.id`
  onError: () => {},
};

const UserProfilePage = wrapSettingsTab(
  {
    title: "Account",
    path: "users/me",
    order: 7,
  },
  UserProfile
);

export default [
  routeWithUserSession({
    path: "/users/me",
    title: "Account",
    render: pageProps => <UserProfilePage {...pageProps} />,
  }),
  routeWithUserSession({
    path: "/users/:userId([0-9]+)",
    title: "Users",
    render: pageProps => <UserProfilePage {...pageProps} />,
  }),
];
