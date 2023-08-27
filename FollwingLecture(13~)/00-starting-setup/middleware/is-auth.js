export const authenication = (req, res, next) => {
   if (!req.session.isLoggedIn) {
      return res.status(401).redirect('/login');
      //Status401을 추가하여 무엇이 문제인지를 분명히 해주되,
      //문제가 없을 시, redirection(300)으로 덮어쓰도록 함
   }
   next();
};
