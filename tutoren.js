//     Tutoren.js 1.2.0 - 02/03/2018
//     (c) 2018 Renan Pinho Assi


(function (window) {
    // 'use strict';

    function tutoren() {
        var _tr = {};

        // Type 1: _EXAMPLE => Underline + Variable name in uppercase | These variables store values who never change (constants)
        // Type 2: EXAMPLE  => Variable name in uppercase | Store values who are sensitive to window resizes (semi-constants)
        // Type 3: Example  => First letter in uppercase  | Values here are recalculated each step (but will be largely used in steps)
        
        // Explanation 1: Use underline to represent spaces in variable names (Some_Example)
        // Explanation 2: Properties are always in uppercase even when the variable is type 3 (Some_Example_HEIGHT)


        /////////////////////////////////////////////////////////////////////////////

        var _BLUEPRINT;             // Each step with all needed properties
        var _CONTAINER_ID;          // Store container id
        var _FOOTER_ID;             // Store footer id
        var _LIMIT;                 // Number of steps

        var _POP_ELEMENT;           // $("#popover")
        var _CONTAINER_ELEMENT;     // $(id)
        var _DARKBG_ELEMENT;        // $("#dark-bg");

        /////////////////////////////////////////////////////////////////////////////

        var VIEWPORT_HEIGHT;        // $(window).height();
        var VIEWPORT_WIDTH;         // $(window).width(); 

        var POP_OFFSET;             // $("#popover").offset()
        var POP_HEIGHT;             // $("#popover").outerheight(true)
        var POP_WIDTH;              // $("#popover").outerwidth(true)

        var CONTAINER_HEIGHT;       // _CONTAINER_ELEMENT.height()
        var CONTAINER_OFFSET;       // $(id).offset()

        var PADDING_TOP;        
        var PADDING_BOTTOM;

        /////////////////////////////////////////////////////////////////////////////

        var Previously_Step;        // _BLUEPRINT[Step-1];
        var Actual_Step;            // _BLUEPRINT[Step];
        var Actual_Element;         // $(_BLUEPRINT[Step].target);
        var Actual_Element_OFFSET;  // $(_BLUEPRINT[Step].target).offset();
        var Actual_Element_HEIGHT;  // $(_BLUEPRINT[Step].target).outerHeight(true);
        var Actual_Element_WIDTH;   // $(_BLUEPRINT[Step].target).outerWidth(true);
        var Actual_Element_TUPLE;   // Store the user option of padding and pop-over location
        var Actual_Target;          // Scroll position after some seconds
        

        var Step;
        var Last_Classes;

        var COMPLETE_RESIZE;

        var alternative_flow;

        /////////////////////////////////////////////////////////////////////////////

        // Destruction Method
        _tr.endTour = function(){
            $("#dark-bg").remove();
            $('#popover').remove();
            try{Actual_Element.removeClass(Last_Classes)}catch(e){};
            $(window).unbind('resize');
            $(window).unbind('hashchange');
            if(Actual_Step.effect.indexOf("link") ){
                $(Actual_Step.button).removeClass(Actual_Step.button_effects);
                $(Actual_Step.button).unbind('mouseup');
            }
        }

        // Constructor Method
        _tr.startTour = function(blueprint,containerID,footerID){
            if(!_tr.running){
                _tr.running = true;
                _BLUEPRINT         = blueprint;
                _CONTAINER_ID      = containerID;
                _FOOTER_ID         = footerID;
                _LIMIT             = _BLUEPRINT.length - 1;   
                _CONTAINER_ELEMENT = $(_CONTAINER_ID);

                Step               = 0;
                Actual_Element     = null;
                Last_Classes       = "";
    
                _CONTAINER_ELEMENT.css({overflow: 'visible'});
                
                
                Calculate_Sensitive_Changes();
    
                Initialize_Popover();
                Initialize_Darkground();
                Next_Step_Configuration();

                               
                $(window).bind('resize', function() {
                    clearTimeout(COMPLETE_RESIZE);
                    console.log(COMPLETE_RESIZE)
                    COMPLETE_RESIZE = setTimeout(function(){
                        console.log("EXECUTOU => " + COMPLETE_RESIZE)
                        Calculate_Sensitive_Changes();
                        Step_Actions();
                        console.log("Resize")
                    },100)
                });

                $(window).bind('hashchange', function() {
                    Reconect_Tutorial();
                    console.log("Alive")
                });
            }
        };

        var Reconect_Tutorial = function(){         
            if(_CONTAINER_ELEMENT[0].innerHTML != $(_CONTAINER_ID)[0].innerHTML){
                _CONTAINER_ELEMENT = $(_CONTAINER_ID);
                _CONTAINER_ELEMENT.css({overflow: 'visible'});
                Actual_Element  = null;
                Last_Classes    = "";
                Calculate_Sensitive_Changes();
                Initialize_Popover();
                Initialize_Darkground();
                Next_Step_Configuration();
            }else{
                setTimeout(function(){Reconect_Tutorial()},500);
            }
        }

        var Calculate_Sensitive_Changes = function(){
            VIEWPORT_HEIGHT    = $(window).height();
            VIEWPORT_WIDTH     = $(window).width(); 
            CONTAINER_HEIGHT   = _CONTAINER_ELEMENT.height();
            CONTAINER_OFFSET   = _CONTAINER_ELEMENT.offset();
            PADDING_TOP        = CONTAINER_OFFSET.top?CONTAINER_OFFSET.top:0;
            PADDING_BOTTOM     = $(_FOOTER_ID).outerHeight(true)?$(_FOOTER_ID).outerHeight(true):0;
        }

        var Initialize_Popover = function(){
            var parsedPopOver = $.parseHTML(
                '<div class="tour-tip" id="popover"  >\
                    <h3 class="tour-tip-title grabbable" id="popover-title"></h3>\
                    <div class="tour-tip-content"><p id="popover-content"></p></div>\
                    <div class="row" style="padding:10px; margin:0">\
                        <div class="col-xs-6">\
                            <div class="btn-group">\
                                <button id="prevBT" class="btn btn-sm btn-default"><i class="glyphicon glyphicon-arrow-left"></i></button>\
                                <button id="nextBT" class="btn btn-sm btn-default"><i class="glyphicon glyphicon-arrow-right"></i></button>\
                            </div>\
                        </div>\
                        <div class="col-xs-6">\
                            <button id="endtourBT" class="btn btn-sm btn-default" style="width:100%" data-role="end">Finalizar Tutorial</button>\
                        </div>\
                    </div>\
                </div>'
            );
            _CONTAINER_ELEMENT.append(parsedPopOver);
            
            _POP_ELEMENT  = $("#popover");
            _POP_TITLE    = $('#popover-title');
            _POP_CONTENT  = $('#popover-content');

            _POP_ELEMENT.css('visibility', 'hidden');

            $("#popover").draggable(
                {handle: "#popover-title"}
            );

            $("#prevBT").click(function() { 
                Step--;

                try{
                    $(Actual_Step.button).removeClass(Actual_Step.button_effects);
                    $(Actual_Step.button).unbind('mouseup');
                }catch(e){}
                try{
                    $(Actual_Step.alt_button).removeClass(Actual_Step.button_effects);
                    $(Actual_Step.alt_button).unbind('mouseup');
                }catch(e){}

                if(Previously_Step.effect.indexOf("link") == -1){
                    Next_Step_Configuration(); 
                }else{
                    location.href = Previously_Step.root_href;
                }
            });

            $("#nextBT").click(function() { 
                Step++;
                try{
                    console.log(Actual_Step.button)
                    console.log(Actual_Step.button_effects)
                    $(Actual_Step.button).removeClass(Actual_Step.button_effects);
                    $(Actual_Step.button).unbind('mouseup');
                    try{
                        $(Actual_Step.alt_button).removeClass(Actual_Step.button_effects);
                        $(Actual_Step.alt_button).unbind('mouseup');
                    }catch(e){}
                }catch(e){}
                if(Actual_Step.effect.indexOf("link") == -1){
                    Next_Step_Configuration();
                }else{
                    location.href = Actual_Step.href;
                }
            });
            $("#endtourBT").click(function() { _tr.endTour(); });
            
        }

        var Initialize_Darkground = function(){
            var parsedDarkground =  $.parseHTML('<div id="dark-bg" class="highlight"></div>');
            _CONTAINER_ELEMENT.append(parsedDarkground);
            _DARKBG_ELEMENT = $("#dark-bg");
            _DARKBG_ELEMENT.css('visibility', 'hidden');
        }

        var Next_Step_Configuration = function(){

            Step == 0      ? $("#prevBT").prop("disabled",true) : $("#prevBT").prop("disabled",false);
            Step == _LIMIT ? $("#nextBT").prop("disabled",true) : $("#nextBT").prop("disabled",false);
    
            $('#popover').css('visibility', 'hidden');
            $("#dark-bg").css('visibility', 'hidden');
            $("#prevBT").css('visibility', 'hidden');
            $("#nextBT").css('visibility', 'hidden');


            try{Actual_Element.removeClass(Last_Classes)}catch(e){};
            Actual_Step           = _BLUEPRINT[Step];
            Previously_Step       = _BLUEPRINT[Step-1];


            _POP_TITLE.html( Actual_Step.title );
            _POP_CONTENT.html( Actual_Step.text );
            Step_Actions();
        }

        var Step_Actions = function(){
            try{
                // var observer = new MutationObserver(function(mutations){
                //     console.log("Something has change");
                //     mutations.forEach(function(mutation) {
                //         console.log(mutation.attributeName);
                //         console.log(mutation);
                //     });
                // });
                // observer.observe($(Actual_Step.target)[0], { 
                //     attributes: true,
                //     childList: true
                // });

                alternative_flow = false;
                
                
                POP_OFFSET            = _POP_ELEMENT.offset();
                POP_HEIGHT            = _POP_ELEMENT.outerHeight(true);
                POP_WIDTH             = _POP_ELEMENT.outerWidth(true);
                
                let yx_tuple         = Actual_Step.popover.split(" ");
                Actual_Element_TUPLE = {
                    "x-alignment":     yx_tuple[1]?yx_tuple[1]:"left",
                    "y-alignment":     yx_tuple[0]?yx_tuple[0]:"top",
                    "x-shift-ammount": yx_tuple[3]?Number(yx_tuple[3]):0,
                    "y-shift-ammount": yx_tuple[2]?Number(yx_tuple[2]):0,
                }
                Set_Pop_Over();
            }catch(e){
                console.log(e)
                setTimeout(function() {Step_Actions()}, 500);
            }
            
        }


        var Check_Existence = function(element){
            if(element!="window"){
                Actual_Element        = $(element);
                Actual_Element_OFFSET = Actual_Element.offset();
                Actual_Element_HEIGHT = Actual_Element.outerHeight(true);
                Actual_Element_WIDTH  = Actual_Element.outerWidth(true);
            }else{
                Actual_Element        = $(window);
                Actual_Element_OFFSET = {left:0, top:0};
                Actual_Element_HEIGHT = VIEWPORT_HEIGHT;
                Actual_Element_WIDTH  = VIEWPORT_WIDTH;
            }

            if(Actual_Element_OFFSET.top == 0 && Actual_Element_OFFSET.left == 0 && Actual_Element_HEIGHT==0){
                return false;
            }
            return true;
        }

        var Set_Pop_Over = function(){

            if(!Check_Existence(Actual_Step.target) && !Check_Existence(Actual_Step.alternative)){
                throw "Still loading something";
            }
         
            let positions_x = ["left","right","inner-left","inner-right","center","default"];
            let positions_y = ["top","center","bottom"];
            let status_x    = Calc_X(Actual_Element_TUPLE["x-alignment"]);
            let status_y    = false;
            let hide_danger = false;
            let pop_over_final;
            let target;
            
            
            if(!status_x){
                positions_x.splice(positions_x.indexOf(Actual_Element_TUPLE["x-alignment"]),1);
                for(var i = 0; !status_x; i++){
                    status_x                   = Calc_X(positions_x[i]);
                    status_x["final_position"] = positions_x[i];
                }
                if(status_x["final_position"] == "inner-right" || status_x["final_position"] == "inner-left" || status_x["final_position"] == "center"){
                    hide_danger = true;
                    positions_y = ["top","bottom"];
                }
            }
            
            if(!hide_danger || Actual_Element_TUPLE["y-alignment"] != "center"){
                status_y["final_position"]  = Actual_Element_TUPLE["y-alignment"];
                status_y                    = Calc_Y(Actual_Element_TUPLE["y-alignment"]);
            }

            if(!status_y){
                console.log("Overflow ou não posso usar center");
                for(var i = 0; !status_y; i++){
                    status_y                    = Calc_Y(positions_y[i]);
                    status_y["final_position"]  = positions_y[i];
                }
            }

            /// Finalização

            pop_over_final = {
                "left": (!status_x["overflow_with_padding"]?status_x["position_with_padding"]:status_x["position"]),
                "top":  (!status_y["overflow_with_padding"]?status_y["position_with_padding"]:status_y["position"])
            }

            switch(status_y["final_position"]){
                case "top":
                    target = pop_over_final.top - PADDING_TOP;
                    break;
                case "center":
                    target = pop_over_final.top - (VIEWPORT_HEIGHT/2);
                    break;
                default:
                    let extra_height = pop_over_final.top + POP_HEIGHT;
                    _CONTAINER_ELEMENT.height(extra_height - PADDING_TOP);
                    target = extra_height - VIEWPORT_HEIGHT + PADDING_BOTTOM;
            }
            
            _POP_ELEMENT.offset(pop_over_final);
            Perform_Scroll(target);
            
        }

        var Perform_Scroll = function(target){
            $('html').animate({
                scrollTop: target
            }, (Actual_Step.scroll?Actual_Step.scroll:1000), 
            function(){
                let effects = Actual_Step.effect.split(" ");
                $('#popover').css('visibility', 'visible');
                $("#prevBT").css('visibility', Actual_Step.arrows=='hidden'?'hidden':'visible');
                $("#nextBT").css('visibility', Actual_Step.arrows=='hidden'?'hidden':'visible');

                for(var i in effects){
                    Effects_Map(effects[i]);
                }
            })
        }

        var Effects_Map = function(effect){
            switch(effect) {
                case "highlight":
                    Last_Classes += " selected-tour";
                    $("#dark-bg").css('visibility', 'visible');
                    Actual_Element.addClass("selected-tour");
                    break;
                case "action":
                    if(Actual_Step.button){
                        $(Actual_Step.button).addClass(Actual_Step.button_effects);
                        $(Actual_Step.button).unbind('mouseup');
                        $(Actual_Step.button).one("mouseup",function(){
                            Step++;
                            $(Actual_Step.button).removeClass(Actual_Step.button_effects);
                            Next_Step_Configuration();
                        })
                        try{
                            $(Actual_Step.alt_button).addClass(Actual_Step.button_effects);
                            $(Actual_Step.alt_button).unbind('mouseup');
                            $(Actual_Step.alt_button).one("mouseup",function(){
                                Step++;
                                $(Actual_Step.alt_button).removeClass(Actual_Step.button_effects);
                                Next_Step_Configuration();
                            })
                        }catch(e){}
                    }
                    break;
                case "link":
                    if(Actual_Step.button){
                        $(Actual_Step.button).addClass(Actual_Step.button_effects);
                        $(Actual_Step.button).unbind('mouseup');
                        $(Actual_Step.button).one("mouseup",function(){
                            $(Actual_Step.button).removeClass(Actual_Step.button_effects);
                            Step++
                        })
                        try{
                            $(Actual_Step.alt_button).addClass(Actual_Step.button_effects);
                            $(Actual_Step.alt_button).unbind('mouseup');
                            $(Actual_Step.alt_button).one("mouseup",function(){
                                $(Actual_Step.alt_button).removeClass(Actual_Step.button_effects);
                                Step++
                            })
                        }catch(e){}
                    }
                    break;
                default:
                    Last_Classes += " " + effect;
                    Actual_Element.addClass(effect);
            }
        }

        var Get_X_Pop_Status = function(position){
            let noPadding;
            let withPadding;
            let noPaddingOverflow = false;
            let withPaddingOverflow = false;
            
            switch(position){
                case "left":
                    noPadding   = Actual_Element_OFFSET.left - POP_WIDTH - 5;
                    withPadding = noPadding - Actual_Element_TUPLE["x-shift-ammount"] - 5;
                    break;
                case "right":
                    noPadding   = Actual_Element_OFFSET.left + Actual_Element_WIDTH + 5;
                    withPadding = noPadding + Actual_Element_TUPLE["x-shift-ammount"] + 5;
                    break;
                case "inner-left":
                    noPadding   = Actual_Element_OFFSET.left;
                    withPadding = noPadding + Actual_Element_TUPLE["x-shift-ammount"];
                    break;
                case "inner-right":
                    noPadding   = Actual_Element_OFFSET.left + Actual_Element_WIDTH - POP_WIDTH;
                    withPadding = noPadding + Actual_Element_TUPLE["x-shift-ammount"];
                    break;
                case "center":
                    noPadding   = Actual_Element_OFFSET.left + (Actual_Element_WIDTH/2) - (POP_WIDTH/2);
                    withPadding = noPadding + Actual_Element_TUPLE["x-shift-ammount"];
                    break;
                default:
                    noPadding   = (VIEWPORT_WIDTH/2) - (POP_WIDTH/2);
                    withPadding = noPadding + Actual_Element_TUPLE["x-shift-ammount"];
                    break;
            }

            noPaddingOverflow   = (noPadding < 0    || noPadding + POP_WIDTH > VIEWPORT_WIDTH);
            withPaddingOverflow = (withPadding < 0  || withPadding + POP_WIDTH > VIEWPORT_WIDTH);

            let response = {
                "position": noPadding,
                "position_with_padding": withPadding,
                "overflow": noPaddingOverflow,
                "overflow_with_padding": withPaddingOverflow
            }
            return response;
        }

        var Get_Y_Pop_Status = function(position){
            let noPadding;
            let withPadding;
            let noPaddingOverflow = false;
            let withPaddingOverflow = false;
            switch(position){
                case "top":
                    noPadding   = Actual_Element_OFFSET.top - POP_HEIGHT - 5;
                    withPadding = noPadding - Actual_Element_TUPLE["y-shift-ammount"] - 5;
                    break;
                case "center":
                    noPadding   = Actual_Element_OFFSET.top + (Actual_Element_HEIGHT/2) - (POP_HEIGHT/2);
                    withPadding = noPadding + Actual_Element_TUPLE["y-shift-ammount"];
                    break;
                default:
                    noPadding   = Actual_Element_OFFSET.top + Actual_Element_HEIGHT + 5;
                    withPadding = noPadding + Actual_Element_TUPLE["y-shift-ammount"] + 5;
                    break;
            }

            noPaddingOverflow   = (noPadding < CONTAINER_OFFSET.top && (noPadding + POP_HEIGHT) <= Actual_Element_OFFSET.top);
            withPaddingOverflow = (withPadding < CONTAINER_OFFSET.top && (withPadding + POP_HEIGHT) <= Actual_Element_OFFSET.top);
            
            let response = {
                "position": noPadding,
                "position_with_padding": withPadding,
                "overflow": noPaddingOverflow,
                "overflow_with_padding": withPaddingOverflow
            }
            return response;
        }

        var Calc_X = function(position){
            let status = Get_X_Pop_Status(position);
            if(status["overflow"] && status["overflow_with_padding"]){
                return false;
            }
            return status;
        }

        var Calc_Y = function(position){
            let status = Get_Y_Pop_Status(position);
            if(status["overflow"] && status["overflow_with_padding"]){
                return false;
            }
            return status;
        }
 


        return _tr;
    }

    if (typeof (window.tutoren) === 'undefined') {
        window.tutoren = tutoren();
    }
})(window);