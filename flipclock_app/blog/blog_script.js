const total_blog = document.getElementsByClassName("blog").length;

let website = "flipclock.app"
var current_poll = "blog_page_poll";

document.getElementById('yes_button').addEventListener('click', function (e) {
  var yes_request = new XMLHttpRequest();
  yes_request.open("GET", `https://api.countapi.xyz/hit/${website}/${current_poll + '_yes'}`);
  yes_request.responseType = "json";

  yes_request.onload = function () {
    document.getElementById('yes_button').innerText += this.response.value;
  }
  yes_request.send();

  var no_request = new XMLHttpRequest();
  no_request.open("GET", `https://api.countapi.xyz/get/${website}/${current_poll + '_no'}`);
  no_request.responseType = "json";

  no_request.onload = function () {
    document.getElementById('no_button').innerText += this.response.value;
  }
  no_request.send();
})


document.getElementById('no_button').addEventListener('click', function (e) {
  var no_request = new XMLHttpRequest();
  no_request.open("GET", `https://api.countapi.xyz/hit/${website}/${current_poll + '_no'}`);
  no_request.responseType = "json";

  no_request.onload = function () {
    document.getElementById('no_button').innerText += this.response.value;
  }
  no_request.send();

  var yes_request = new XMLHttpRequest();
  yes_request.open("GET", `https://api.countapi.xyz/get/${website}/${current_poll + '_yes'}`);
  yes_request.responseType = "json";

  yes_request.onload = function () {
    document.getElementById('yes_button').innerText += this.response.value;
  }
  yes_request.send();
})



function total_likes(blog_number) {
  var likes = new XMLHttpRequest();
  likes.open("GET", `https://api.countapi.xyz/get/flipclock.app/blog${blog_number}_total_likes`);
  likes.responseType = "json";

  likes.onload = function () {
    document.getElementById(`blog${blog_number}_total_likes`).innerText = this.response.value;
  }
  likes.send();
};

function total_views(blog_number) {
  var total_views = new XMLHttpRequest();
  total_views.open("GET", `https://api.countapi.xyz/get/flipclock.app/blog${blog_number}_total_views`);
  total_views.responseType = "json";

  total_views.onload = function () {
    document.getElementById(`blog${blog_number}_total_views`).innerText = this.response.value;
  }
  total_views.send();
}


// MAIN FUNCTION TO ALLOCATE INFORMATION
for (var i = 1; i <= total_blog; i++) {
  var blog_number = i;

  total_likes(blog_number);
  total_views(blog_number);

}

