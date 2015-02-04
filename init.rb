Redmine::Plugin.register :promove do
  name 'Promove plugin'
  author 'Pedro Melo'
  description 'This is a plugin for Redmine'
  version '0.0.1'
  url 'http://promovesolucoes.com'
  author_url 'http://promovesolucoes.com'

  # syntax is:
  # menu(menu_name, item_name, url, options={})
  menu :top_menu, :indicadores , { :controller => 'prm_indicadores', :action => 'index'}, :caption => 'Indicadores'
  # menu :top_menu, :templates, "http://yourredmine.com/redmine/projects/biblioteca-de-ativos/wiki/Templates", :caption => 'Templates'

end
