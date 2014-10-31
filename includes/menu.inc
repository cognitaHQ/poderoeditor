     <div class="navbar navbar-inverse navbar-fixed-top" role="navigation">
      <div class="container">
        <div class="navbar-header">
          <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
            <span class="sr-only">Toggle navigation</span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
          </button>
          <a class="navbar-brand" href="#">PoderoEditor</a>
        </div>
        <div class="collapse navbar-collapse">
          <ul class="nav navbar-nav navbar-right">
            <li><a href="/">Home</a></li>
            {%if "username" not in session %}
            <li><a href="/login">{{flod.languages[flod.labelLanguage].menu_login}}</a></li>
            {%else%}
            
            <li><a href="/admin/edituser">{{flod.languages[flod.labelLanguage].menu_profile}}</a></li>
            <li><a href="/search">{{flod.languages[flod.labelLanguage].menu_search}}</a></li>
            <li><a href="/addEntity">{{flod.languages[flod.labelLanguage].menu_add_entity}}</a></li>
            <li><a href="/import">{{flod.languages[flod.labelLanguage].menu_import}}</a></li>
            <li><a href="/logout">{{flod.languages[flod.labelLanguage].menu_logout}}</a></li>
            {%endif%}
          </ul>
        </div><!--/.nav-collapse -->
      </div>
    </div>