//     Tutoren.js 1.4.1 - 19/07/2018
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

        var _FULL_MAP;
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
        var Alternative_Prev;       
        var Alternative_Next;
        

        var Step;
        var Last_Classes;

        var COMPLETE_RESIZE;

        var alternative_flow;


        var mouse_up_handler = function(e) { 
            if(e.path[0].id == "popover-title"){
                e.preventDefault();
                e.stopPropagation();
            }
            
        }

        var click_handler = function(e) { 
            let Xm = e.pageX;
            let Ym = e.pageY;
            let Allowed_Buttons;
            let Other_buttons;

            try{
                Allowed_Buttons = Actual_Step.button.split(" ");
            }catch(e){
                Allowed_Buttons = [];
            }
            try{
                Other_buttons = Actual_Step.buttons_allowed.split(" ");
            }catch(e){}

            if(!Check_Valid_Click(Xm,Ym,Allowed_Buttons,Other_buttons)){
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        }

        
        /////////////////////////////////////////////////////////////////////////////

        // Destruction Method
        _tr.endTour = function(){
            $("#dark-bg").remove();
            $('#popover').remove();
            Remove_Extra_Effect();
            try{Actual_Element.removeClass(Last_Classes)}catch(e){};
            $(window).unbind('resize');
            $(window).unbind('hashchange');
            if(Actual_Step.effect.indexOf("link") ){
                $(Actual_Step.button).removeClass(Actual_Step.button_effects);
                $(Actual_Step.button).unbind('mouseup');
            }
            document.removeEventListener('mouseup', mouse_up_handler, true);
            document.removeEventListener('click', click_handler, true);
            _tr.running = false;
        }

        // Constructor Method
        _tr.startTour = function(blueprint,containerID,footerID){
            if(!_tr.running){
                _tr.running = true;
                if(blueprint["primary_track"]){
                    _FULL_MAP      = blueprint;
                    _BLUEPRINT     = blueprint["primary_track"];
                }else{
                    _FULL_MAP      = null;
                    _BLUEPRINT     = blueprint;
                }

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
                    COMPLETE_RESIZE = setTimeout(function(){
                        Calculate_Sensitive_Changes();
                        Step_Actions();
                    },100)
                });

                $(window).bind('hashchange', function() {
                    Reconect_Tutorial();
                });

                document.addEventListener('mouseup', mouse_up_handler, true);
                document.addEventListener('click', click_handler, true);
            }
        };

        var Check_Valid_Click = function(Xm,Ym,Allowed_Buttons,Other_buttons){
            let _SCREEN_BUTTONS = ["#nextBT","#prevBT","#endtourBT"];
            for(var i in _SCREEN_BUTTONS){
                let el = $(_SCREEN_BUTTONS[i]);
                let Xi = el.offset().left;
                let Yi = el.offset().top;
                let Xf = el.outerWidth()  + Xi;
                let Yf = el.outerHeight() + Yi;
                if(Xm <= Xf && Xm >= Xi && Ym <= Yf && Ym >= Yi){
                    return true;
                }
            }
            for(var i in Allowed_Buttons){
                let el = $(Allowed_Buttons[i]);
                let Xi = el.offset().left;
                let Yi = el.offset().top;
                let Xf = el.outerWidth()  + Xi;
                let Yf = el.outerHeight() + Yi;
                if(Xm <= Xf && Xm >= Xi && Ym <= Yf && Ym >= Yi){
                    el.mouseup();
                    return true;
                }
            }

            for(var i in Other_buttons){
                let el = $(Other_buttons[i]);
                let Xi = el.offset().left;
                let Yi = el.offset().top;
                let Xf = el.outerWidth()  + Xi;
                let Yf = el.outerHeight() + Yi;
                if(Xm <= Xf && Xm >= Xi && Ym <= Yf && Ym >= Yi){
                    el.mouseup();
                    return true;
                }
            }
            return false;
        }
        var Alternative_Prev_Action = function(){
            try{
                let split_alternative   = Actual_Step.prev.split(" ");
                _BLUEPRINT              = _FULL_MAP[split_alternative[0]];
                _LIMIT                  = _BLUEPRINT.length - 1;   
                Step                    = Number(split_alternative[1]); 
            }catch(e){
                Step--;
            }
        }

        var Alternative_Next_Action = function(){
            try{
                let split_alternative   = Actual_Step.next.split(" ");
                _BLUEPRINT              = _FULL_MAP[split_alternative[0]];
                _LIMIT                  = _BLUEPRINT.length - 1;   
                Step                    = Number(split_alternative[1]);
            }catch(e){
                Step++;
            }
        }

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
                    <h3 class="modal-header tour-tip-title grabbable" id="popover-title"></h3>\
                    <div class="modal-body tour-tip-content" style="padding-bottom:10px"><p id="popover-content"></p></div>\
                    <div class="row modal-footer" style="padding:10px; margin:0">\
                        <div class="col-xs-6">\
                            <button id="endtourBT" class="btn btn-sm btn-default" style="width:100%" data-role="end">Finalizar Tutorial</button>\
                        </div>\
                        <div class="col-xs-3">\
                            <div class="btn-group" style="width:100%">\
                                <button id="prevBT" style="width:100%" class="btn btn-sm btn-default"><i class="glyphicon glyphicon-arrow-left"></i></button>\
                            </div>\
                        </div>\
                        <div class="col-xs-3">\
                            <div class="btn-group" style="width:100%">\
                                <button id="nextBT" style="width:100%" class="btn btn-sm btn-default"><i class="glyphicon glyphicon-arrow-right"></i></button>\
                            </div>\
                        </div>\
                    </div>\
                </div>'
            );
            
            _CONTAINER_ELEMENT.append(parsedPopOver);
            
            _POP_ELEMENT  = $("#popover");
            _POP_TITLE    = $('#popover-title');
            _POP_CONTENT  = $('#popover-content');

            _POP_ELEMENT.css('visibility', 'hidden');

            $("#popover").draggable({handle: "#popover-title"});

            $("#prevBT").click(function() { 
                Remove_Extra_Effect();
                try{
                    $(Actual_Step.button).removeClass(Actual_Step.button_effects);
                    $(Actual_Step.button).unbind('mouseup');
                }catch(e){}
                try{
                    $(Actual_Step.alt_button).removeClass(Actual_Step.button_effects);
                    $(Actual_Step.alt_button).unbind('mouseup');
                }catch(e){}

                if(Previously_Step.effect.indexOf("link") == -1){
                    Alternative_Prev_Action();
                    Next_Step_Configuration(); 
                }else{
                    location.href = Previously_Step.root_href;
                    Alternative_Prev_Action();
                }
            });

            $("#nextBT").click(function(e) { 
                Remove_Extra_Effect();
                try{
                    $(Actual_Step.button).removeClass(Actual_Step.button_effects);
                    $(Actual_Step.button).unbind('mouseup');
                    try{
                        $(Actual_Step.alt_button).removeClass(Actual_Step.button_effects);
                        $(Actual_Step.alt_button).unbind('mouseup');
                    }catch(e){}
                }catch(e){}
                if(Actual_Step.effect.indexOf("link") == -1){
                    Alternative_Next_Action();
                    Next_Step_Configuration();
                }else{
                    location.href = Actual_Step.href;
                    Alternative_Next_Action();
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
            Alternative_Prev = _BLUEPRINT[Step].prev?_BLUEPRINT[Step].prev:false;       
            Alternative_Next = _BLUEPRINT[Step].next?_BLUEPRINT[Step].next:false;

            Step == 0      && !Alternative_Prev ? $("#prevBT").prop("disabled",true) : $("#prevBT").prop("disabled",false);
            Step == _LIMIT && !Alternative_Next ? $("#nextBT").prop("disabled",true) : $("#nextBT").prop("disabled",false);
    
            $('#popover').css('visibility', 'hidden');
            $("#dark-bg").css('visibility', 'hidden');
            $("#prevBT").css('visibility', 'hidden');
            $("#nextBT").css('visibility', 'hidden');
            Remove_Extra_Effect();
            try{
                Actual_Element.removeClass(Last_Classes);
            }catch(e){};

            
            Actual_Step = _BLUEPRINT[Step];
            if(Alternative_Prev){
                let split_alternative   = Actual_Step.prev.split(" ");
                Previously_Step         = _FULL_MAP[split_alternative[0]][split_alternative[1]];
            }else{
                Previously_Step         = _BLUEPRINT[Step-1];
            }
            
            

            _POP_TITLE.html( Actual_Step.title );
            _POP_CONTENT.html( Actual_Step.text );
            Step_Actions();
        }

        var Step_Actions = function(){
            try{
                alternative_flow = false;
                
                
                POP_OFFSET           = _POP_ELEMENT.offset();
                POP_HEIGHT           = _POP_ELEMENT.outerHeight(true);
                POP_WIDTH            = _POP_ELEMENT.outerWidth(true);
                
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
                    _CONTAINER_ELEMENT.css("min-height", (extra_height - PADDING_TOP)+"px");
                    target = extra_height - VIEWPORT_HEIGHT + PADDING_BOTTOM;
            }

            if(Actual_Step.slide){
                Perform_Slide(
                    {
                        top: pop_over_final.top - _POP_ELEMENT.offset().top,
                        left: pop_over_final.left - _POP_ELEMENT.offset().left
                    }
                );
            }else{
                _POP_ELEMENT.offset(pop_over_final);
                Perform_Scroll(target);
            }
        }

        var Perform_Slide = function(target){
            $('#popover').css('visibility', 'visible');
            $("#prevBT").css('visibility', Actual_Step.arrows=='hidden'?'hidden':'visible');
            $("#nextBT").css('visibility', Actual_Step.arrows=='hidden'?'hidden':'visible');
            $(_POP_ELEMENT).animate({
                top: "+="+target.top,
                left: "+="+target.left,
            }, (Actual_Step.slide?Actual_Step.slide:1000),
            function(){
                let effects = Actual_Step.effect.split(" ");
                for(var i in effects){
                    Effects_Map(effects[i]);
                }
            });
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
            });
        }

        var Effects_Map = function(effect){
            Bind_Extra_Effect();
            switch(effect) {
                case "highlight":
                    Last_Classes += " selected-tour";
                    $("#dark-bg").css('visibility', 'visible');
                    Actual_Element.addClass("selected-tour");
                    break;
                case "action":
                    Actual_Step.limit = Actual_Step.limit?Actual_Step.limit:0;
                    Actual_Step.counter = Actual_Step.counter?Actual_Step.counter:0;
                    if(Actual_Step.button){
                        Actual_Step.counter = 0;
                        Bind_Action_Event(Actual_Step.button);
                        try{
                            Bind_Action_Event(Actual_Step.alt_button);
                        }catch(e){}
                    }

                    break;
                case "link":
                    if(Actual_Step.button){
                        $(Actual_Step.button).addClass(Actual_Step.button_effects);
                        $(Actual_Step.button).unbind('mouseup');
                        $(Actual_Step.button).one("mouseup",function(){
                            $(Actual_Step.button).removeClass(Actual_Step.button_effects);
                            Alternative_Next_Action();
                        })
                        try{
                            $(Actual_Step.alt_button).addClass(Actual_Step.button_effects);
                            $(Actual_Step.alt_button).unbind('mouseup');
                            $(Actual_Step.alt_button).one("mouseup",function(){
                                $(Actual_Step.alt_button).removeClass(Actual_Step.button_effects);
                                Alternative_Next_Action();
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
            let noPaddingOverflow   = false;
            let withPaddingOverflow = false;
            let REFERENCE_POINT     = (Actual_Step.effect.indexOf("link")!=-1 || Actual_Step.effect.indexOf("action")!=-1)? $(Actual_Step.button) : Actual_Element;
            let REFERENCE_OFFSET    = REFERENCE_POINT.offset();
            let REFERENCE_WIDTH     = REFERENCE_POINT.outerWidth(true);
            
            switch(position){
                case "left":
                    noPadding   = REFERENCE_OFFSET.left - POP_WIDTH - 5;
                    withPadding = noPadding - Actual_Element_TUPLE["x-shift-ammount"] - 5;
                    break;
                case "right":
                    noPadding   = REFERENCE_OFFSET.left + REFERENCE_WIDTH + 5;
                    withPadding = noPadding + Actual_Element_TUPLE["x-shift-ammount"] + 5;
                    break;
                case "inner-left":
                    noPadding   = REFERENCE_OFFSET.left;
                    withPadding = noPadding + Actual_Element_TUPLE["x-shift-ammount"];
                    break;
                case "inner-right":
                    noPadding   = REFERENCE_OFFSET.left + REFERENCE_WIDTH - POP_WIDTH;
                    withPadding = noPadding + Actual_Element_TUPLE["x-shift-ammount"];
                    break;
                case "center":
                    noPadding   = REFERENCE_OFFSET.left + (REFERENCE_WIDTH/2) - (POP_WIDTH/2);
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
            let noPaddingOverflow   = false;
            let withPaddingOverflow = false; 
            let REFERENCE_POINT     = (Actual_Step.effect.indexOf("link")!=-1 || Actual_Step.effect.indexOf("action")!=-1)? $(Actual_Step.button) : Actual_Element;
            let REFERENCE_OFFSET    = REFERENCE_POINT.offset();
            let REFERENCE_HEIGHT    = REFERENCE_POINT.outerHeight(true);
            
            switch(position){
                case "top":
                    noPadding   = REFERENCE_OFFSET.top - POP_HEIGHT - 5;
                    withPadding = noPadding - Actual_Element_TUPLE["y-shift-ammount"] - 5;
                    break;
                case "center":
                    noPadding   = REFERENCE_OFFSET.top + (REFERENCE_HEIGHT/2) - (POP_HEIGHT/2);
                    withPadding = noPadding + Actual_Element_TUPLE["y-shift-ammount"];
                    break;
                default:
                    noPadding   = REFERENCE_OFFSET.top + REFERENCE_HEIGHT + 5;
                    withPadding = noPadding + Actual_Element_TUPLE["y-shift-ammount"] + 5;
                    break;
            }

            noPaddingOverflow   = (noPadding < CONTAINER_OFFSET.top && (noPadding + POP_HEIGHT) <= REFERENCE_OFFSET.top);
            withPaddingOverflow = (withPadding < CONTAINER_OFFSET.top && (withPadding + POP_HEIGHT) <= REFERENCE_OFFSET.top);
            
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

        var Bind_Action_Event = function(button){
            $(button).addClass(Actual_Step.button_effects);
            $(button).unbind('mouseup');
            $(button).mouseup(function(){
                Actual_Step.counter += 1;
                if(Actual_Step.counter >= Actual_Step.limit){
                    Actual_Step.counter = 0;
                    $(button).removeClass(Actual_Step.button_effects);
                    $(button).unbind('mouseup');
                    Alternative_Next_Action();
                    Next_Step_Configuration();
                }
            })
        }

        var Bind_Extra_Effect = function(){
            try{
                let extra_buttons = Actual_Step.buttons_allowed.split();
                for(let i in extra_buttons){
                    $(extra_buttons[i]).addClass(Actual_Step.allowed_effects);
                }
            }catch(e){
                console.log(e)
            }
        }

        var Remove_Extra_Effect = function(){
            try{
                let extra_buttons = Actual_Step.buttons_allowed.split();
                for(let i in extra_buttons){
                    $(extra_buttons[i]).removeClass(Actual_Step.allowed_effects);
                }
            }catch(e){}
        }


        return _tr;
    }

    if (typeof (window.tutoren) === 'undefined') {
        window.tutoren = tutoren();
    }
})(window);