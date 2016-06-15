  var photos = [];
  var comments = [];
  var $slides = $("#slides");
  var $comments = $("#comments");
  var $comments_list = $comments.find("ul");
  var visibleID = 1;
  var photoInfo = {};

  var source_info = $("#photoInfo_template").html();
  var source_photos = $("#photos_template").html();
  var source_comment = $("#comment_template").html();
  var $photoInfo_template = Handlebars.compile(source_info);
  var $comment_template = Handlebars.compile(source_comment);
  var $photos_template = Handlebars.compile(source_photos);
  
  function loadPhotos(){
    $.ajax({
      url: "/photos",
      success: function(json){
        photos = json;
        updatePhoto();
        getPhotoInfoByID(visibleID);
        updatePhotoInfo();

         //因为是异步请求数据，所以向页面添加元素应该在数据请求完成后加载
        updatePhotoInfo();
        //$comments.prepend($photoInfo_template(photoInfo));
      }
    });
  }
  function updateCommentsForID(id){
    $.ajax({
      url: "/comments",
      data: {
        photo_id: id
      },
      success: function(json) {
        comments = json;

        $comments_list.empty();
        $comments_list.append($comment_template({comments: comments}));
      }
    });
  }
  
  function getVisibleFigureID() {
    return $slides.find("figure:visible").data().id; 
  }

  function getPhotoInfoByID(id) {
    photos.forEach(function(data){
      if (data.id === +id) {
        photoInfo = data;
        return false;
      }
    });
  }

  function updatePhotoInfo(){
    $comments.find("header").remove();
    $comments.prepend($photoInfo_template(photoInfo));
  }
  function updatePhoto(){
    $slides.append($photos_template({photos: photos}));
  }


  function showNextPhoto(e){
    e.preventDefault();
    visibleID = visibleID === 3 ? 1 : visibleID + 1;
    switchPhoto();
  }
  function showLastPhoto(e){
    e.preventDefault();
    visibleID = visibleID === 1 ? 3 : visibleID - 1;
    switchPhoto();
  }
  function switchPhoto(){
    $("figure:visible").hide();
    $("[data_id=" + visibleID + "]").show();
    $("#photo_id").val(visibleID);
    getPhotoInfoByID(visibleID);
    updatePhotoInfo();
    updateCommentsForID(visibleID);
  }
  

  function addLikes(e){
    e.preventDefault();
    $.ajax({
      method: "POST",
      url: "/photos/like",
      data: { photo_id: visibleID }
    });
    photoInfo.likes += 1;
    updatePhotoInfo();

  }

  function addFavorites(e) {
    e.preventDefault();
    $.ajax({
      method: "POST",
      url: "/photos/favorite",
      data: { photo_id: visibleID }
    });
    photoInfo.favorites += 1;
    updatePhotoInfo();
  }

  function addComment(e){
    e.preventDefault();
    var $f = $("form");
    $.ajax({
      method: "POST",
      url: "/comments/new",
      data: $f.serialize(),
      success: function(){
        updateCommentsForID(visibleID);
        $f.get(0).reset();
      }
    });
  }


  function bindEvents(){
    $slides.on("click","a.next", $.proxy(this.showNextPhoto, this));
    $slides.on("click","a.last", $.proxy(this.showLastPhoto, this));
    $comments.on("click", "a.likes", $.proxy(this.addLikes, this));
    $comments.on("click", "a.favorites", $.proxy(this.addFavorites, this));
    $("#post_comment").on("submit", $.proxy(this.addComment, this));
  }
  loadPhotos();
  updateCommentsForID(1);
  bindEvents();

  
  


  
