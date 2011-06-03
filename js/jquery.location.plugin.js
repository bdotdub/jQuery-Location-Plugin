(function($){
    //Main function
    $.fn.locationWidget = function(options){
        $.fn.locationWidget.options = $.extend({}, $.fn.locationWidget.options, options);
        options = $.fn.locationWidget.options;
        //Prepare the hidden fields
        var cityWoeidField = $('<input></input>').attr('type', 'hidden').attr('name', 'city_woeid').attr('id', 'city_woeid');
        var countryIsoField = $('<input></input>').attr('type', 'hidden').attr('name', 'country_iso').attr('id', 'country_iso');
        $(options.searchInput).after(cityWoeidField);
        $(options.searchInput).after(countryIsoField);

        //Prepare the UI
        var div = $('<div></div>').addClass('location-results').attr('id', 'location-results');
        var header = $('<p></p>').html('Choose the correct location below...');
        var ul = $('<ul></ul>').attr('id', 'location-suggest');
        $(options.searchInput).parent().append(div.append(header).append(ul));
        $(options.resultCanvas).hide();

        //Avoid submit the form when enter key pressed
        if($(options.searchInput).length > 0){
            $(options.searchInput).bind('keypress', function(event){
                if(event.which == 13){
                    event.preventDefault();
                    if($(options.searchInput).val().length > 0){
                        $.fn.locationWidget.geocode();
                    }
                }
            });
        }

        //Bind the search
        if($(options.searchButton).length > 0){
            $(options.searchButton).bind('click', function(e){
                if($(options.cityWoeid).val().length == 0 && $(options.searchInput).val().length > 0){
                    $.fn.locationWidget.geocode();
                }else{
                    if($(options.searchInput).hasClass('edited') && $(options.searchInput).val().length > 0){
                        $.fn.locationWidget.geocode();
                    }
                }
            });
        }

        //Bind the blur event
        if($(options.searchInput).length > 0){
            $(options.searchInput).bind('blur', function(){
                if($(options.cityWoeid).val().length == 0 && $(options.searchInput).val().length > 0){
                    $.fn.locationWidget.geocode();
                }else{
                    if($(options.searchInput).hasClass('edited') && $(options.searchInput).val().length > 0){
                        $.fn.locationWidget.geocode();
                    }
                }
            });

            $(options.searchInput).bind('change', function(){
                $(options.searchInput).addClass('edited');
            });
        }
    };

    //Geocode location with yahoo api
    $.fn.locationWidget.geocode = function(){
        if($.fn.locationWidget.searchInProgess){
            return false;
        }

        options = $.fn.locationWidget.options;

        $(options.searchInput).css('background', '#fff url(images/spinner.gif) 98% 50% no-repeat');

        var url = 'http://where.yahooapis.com/v1/places$and(.q(' + escape($(options.searchInput).val()) + '),.type(7));count=0?format=json&lang=' + options.locale + '&appid=' + options.yahooApiKey + "&callback=?";

        $.getJSON(url, function(data){
            if(data.places.total > 0){
                $(options.searchInput).attr('readonly', 'readonly');

                $(options.resultList).html('');
                $(data.places.place).each(function(i, e){
                    var name = e.name;
                    if(e.admin1 != e.name){
                        name += ', ' + e.admin1;
                    }

                    name += ', ' + e.country;

                    $(options.resultList).append($('<li></li>').append($('<a></a>').attr('href' , '#').html(name)).bind('click', function(event){
                        event.preventDefault();
                        $(options.cityWoeid).val(e.woeid);
                        $(options.countryIso).val(e['country attrs'].code);
                        $(options.searchInput).val($(this).children().html());
                        $(options.resultCanvas).hide();
                        $(options.searchInput).removeClass('edited');

                        $(options.searchInput).attr('readonly', '');
                        $(options.searchInput).blur();

                        $.fn.locationWidget.searchInProgess = false;
                    }));
                });

                $(options.resultCanvas + ' p').html('Choose the correct location below...').removeClass('noresults');
                $(options.resultList).show();

                $.fn.locationWidget.searchInProgess = true;
            }else{
                $(options.resultCanvas + ' p').html('No results for <strong>' + $(options.searchInput).val() + '</strong>').addClass('noresults');
                $(options.resultList).hide();

                $(options.searchInput).removeClass('edited');

                $.fn.locationWidget.searchInProgess = false;
            }

            $(options.searchInput).css('background', '#FFF');
            $(options.resultCanvas).show();
        });
    };

    $.fn.locationWidget.searchInProgess = false;

    //Default options
    $.fn.locationWidget.options = {
        resultCanvas: '#location-results',
        resultList: '#location-suggest',
        searchInput: '',
        searchButton: '',
        yahooApiKey: '',
        cityWoeid: '#city_woeid',
        countryIso: '#country_iso',
        locale: 'en'
    }
})(jQuery);
