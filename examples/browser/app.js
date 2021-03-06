var grout = new Grout({logLevel: 'trace'});

  // console.log('utils', grout.utils);
  //Set logged in status when dom is loaded
  document.addEventListener("DOMContentLoaded", function(event) {
    setStatus();
  });
  //Set status styles
  function setStatus() {
    var statusEl = document.getElementById("status");
    var logoutButton = document.getElementById("logout-btn");

    if(grout.isLoggedIn){
      statusEl.innerHTML = "True";
      statusEl.style.color = 'green';
      // statusEl.className = statusEl.className ? ' status-loggedIn' : 'status-loggedIn';
      logoutButton.style.display='inline';
    } else {
      statusEl.innerHTML = "False";
      statusEl.style.color = 'red';
      logoutButton.style.display='none';
    }
  }
  //Login user based on entered credentials
  function login(){
    console.log('Login called');
    var username = document.getElementById('login-username').value;
    var password = document.getElementById('login-password').value;
// {username:username, password:password}
    grout.login('google').then(function (loginInfo){
      console.log('successful login:', loginInfo);
      setStatus();
    }, function (err){
      console.error('login() : Error logging in:', err);
    });
  }
  //Log currently logged in user out
  function logout(){
    console.log('Logout called');
    grout.logout().then(function(){
      console.log('successful logout');
      setStatus();
    }, function (err){
      console.error('logout() : Error logging out:', err);
    });
  }
  //Signup and login as a new user
  function signup(){
    console.log('signup called');

    var name = document.getElementById('signup-name').value;
    var username = document.getElementById('signup-username').value;
    var email = document.getElementById('signup-email').value;
    var password = document.getElementById('signup-password').value;

    grout.signup().then(function(){
      console.log('successful logout');
      setStatus();
    }, function(err){
      console.error('logout() : Error logging out:', err);
    });
  }
  //Get list of applications
  function getProjects(){
    console.log('getProjects called');
    grout.Projects.get().then(function(appsList){
      console.log('apps list loaded:', appsList);
      var outHtml = '<h2>No app data</h2>';
      if (appsList) {
        outHtml = '<ul>';
        appsList.forEach(function(app){
          outHtml += '<li>' + app.name + '</li></br>'
        });
        outHtml += '</ul>';
      }
      document.getElementById("output").innerHTML = outHtml;
    });
  }

  //Get single file content
  function getFile() {
    var file = grout.Project('test', 'scott').File({key: 'index.html', path: 'index.html'});
    console.log('fbUrl', file.fbUrl);
    console.log('fbRef', file.fbRef);
    file.get().then(function(app){
      console.log('file loaded:', app);
      document.getElementById("output").innerHTML = JSON.stringify(app);
    });
  }
  //Get File/Folder structure for application
  function getFirepad(){
    console.log('getStructure called');
    // grout.Project('exampleProject').Directory.buildStructure().then(function(app){
    //   console.log('apps list loaded:', app);
    //   document.getElementById("output").innerHTML = JSON.stringify(app);
    // });
    var file = grout.Project('test').File({name: 'index.html', key: 'index.html', path: 'index.html'});
    //// Create ACE
    var editor = ace.edit("firepad-container");
    editor.setTheme("ace/theme/textmate");
    var session = editor.getSession();
    session.setUseWrapMode(true);
    session.setUseWorker(false);
    session.setMode("ace/mode/javascript");
    file.openInFirepad(editor).then(function(openFile){
      file.getConnectedUsers().then(function(users){
        document.getElementById("output").innerHTML = JSON.stringify(users);
      });
    });
  }
  function addFile() {
    grout.Project('test', 'scott').Directory.addFile({path: 'test.js'}).then(function(newFileRes) {
      console.log('New file created successfully', newFileRes);
    }, function(err){
      console.error('Error creating new file: ', err);
    });
  }

  function deleteFile() {
    grout.Project({name: 'test', owner: 'scott'}).File('hello.js').remove().then(res => {
      console.log('file deleted:', res);
    }, err => {
      console.error('error deleting file', err);
    })
  }
  function addCollaborator() {
    grout.Project({name: 'test', owner: 'scott'}).addCollaborator('mel').then(res => {
      console.log('collaborator added successfully:', res);
    }, err => {
      console.error('error adding collaborator', err);
    });
  }
  //Get list of users
  function getUsers(){
    console.log('getUsers called');
    grout.Users.get().then(function(app){
      console.log('apps list loaded:', app);
      document.getElementById("output").innerHTML = JSON.stringify(app);
    }, function(err){
      console.error('Error getting users:', err);
    });
  }
  //Search users based on a provided string
  function searchUsers(searchStr){
    console.log('getUsers called');
    if(!searchStr){
      searchStr = document.getElementById('search').value;
    }
    grout.Users.search(searchStr).then(function(users){
      console.log('search users loaded:', users);
      document.getElementById("search-output").innerHTML = JSON.stringify(users);
    });
  }
