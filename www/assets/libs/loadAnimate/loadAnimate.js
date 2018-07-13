function ApploadAnimate(){
  if(window.electron){
    if(window.electron.parameter.panelId == null){
      var $loadAnime = $('.Loadingscreen .container .load');
      var count = window.electron.parameter.AppCounter;

      $loadAnime.removeClass('load-hart');
      $loadAnime.removeClass('load-megane');
      $loadAnime.removeClass('load-suki');

      if( count % 5 == 0 ){
        var mod = Math.floor(Math.random() * 10) % 3;
        //var mod = count % 3;
        switch (mod) {
          case 0:
            $loadAnime.addClass('load-hart');
          break;
          case 1:
            $loadAnime.addClass('load-megane');
          break;
          case 2:
            $loadAnime.addClass('load-suki');
          break;
        } 
      }
    }
  }
};
