function loaded(files){

  addIds(files)

  var views = new MainView(_(files).reverse());

}


function addIds(files){
  _(files).each(function(file){
    file.id = _.uniqueId()
  });
}



//accepts an array of items with title id property
function ListView(title, endpoint, items){

  var $el = $('<div>').addClass(endpoint);

  render()


  function template(){
    var listItems = _(items).map(function(item){

      return li( a({href:'#/'+endpoint+'/'+item.id},item.title))

    }).join('')

    return [
      h4(title),
      ul(listItems)
    ]
  }

  function render(){
    $el.html(template())
  }

  return {
    render: render,
    $el: function(){ return $el },
  }


}

function PostView(file){

  var $el = $('<div>').addClass('post');

  render();

  function loadBody(callback){
    if(!file.body){
      $.ajax({
        url: file._links.git,
        beforeSend: function(request){
          request.setRequestHeader("Accept", "application/vnd.github.VERSION.raw");
        },
        success:function(blob){

           file.body = marked.parse(blob)
           render()
           callback()

        }
      })
    } else {
      render();
    }
  }

  function template(){
    var mo = moment(file.created);
    var pretty = b('Posted')+': '+mo.fromNow()

    return file.body + p({class:'datestamp'},pretty)
  }

  function update(_file,callback){
    file = _file;
    loadBody(callback)
  }

  function render(){
    $el.html(template());
  }

  return {
    update:update,
    $el: function(){ return $el }
  }

}

function MainView(files){

  var $el = $('body');

  var listView = new ListView('Posts','posts',listItems(files));
  var postView = new PostView(files[0]);

  render();
  loadPage()
  window.onhashchange = loadPage

  function listen(){
    $el.find('.posts a').click(function(e){
      var href = $(this).attr('href');
      var id = href.replace('#/posts/','')
    });
  }

  function loadPage(){
    var href = window.location.hash;
    var id = href.replace('#/posts/','')


    loadPost(id);
  }

  function loadPost(id){
    var file = _(files).where({id:id})[0];
    if(!file){
      file = files[0]
    }
    postView.update(file,render);
  }

  function listItems(files){
    return _(files).map(function(file){
      return {
        title: file.name.replace('.md',''),
        id: file.id,
      };
    })

  }

  function template(){
    return [
      listView.$el(),
      postView.$el()
    ];
  }

  function render(){
    $el.html(template())
    listen()
  }
}