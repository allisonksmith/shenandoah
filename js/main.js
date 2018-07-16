$(document).ready(function(){

   
    // ***************************************************** 
    // INPUT ERROR MISTAKE LOG
    var mistakes = [];
    // when an input it changed - the field is logged if its invalid
    $("input").change(function(){
        if(!this.checkValidity()){
            if (mistakes.includes(this.id)){
                //do nothing
            } else{
                mistakes.push(this.id);
            }
        } else {
            var index = mistakes.indexOf(this.id);
            if (index !== -1){mistakes.splice(index,1);}
        }
        mistakeCheck(mistakes)
    }); 
    // checks to see if there are any invalid field - if there are the user can't submit 
    function mistakeCheck(mistakes){
        if(mistakes.length > 0){
            document.getElementById("btnUpdate").disabled = true;
            document.getElementById("btnUpdate").value = "Correct entry mistakes to submit";
        } else {
            document.getElementById("btnUpdate").disabled = false;
            document.getElementById("btnUpdate").value = 'Submit Recommendation';
        }
    };
    

    
    // ***************************************************** 
    // ESRI REQUIRE
    require([
        "esri/Map",
        "esri/views/MapView",
        "esri/layers/FeatureLayer",
        "esri/layers/Layer",
        "esri/layers/support/Field",
        "esri/widgets/LayerList",
        "esri/Graphic",
        "esri/widgets/Expand",
        "esri/widgets/Home",
        "esri/widgets/Track",
        "esri/widgets/Search",
        "esri/geometry/Extent",
        "esri/Viewpoint",
        "esri/core/watchUtils",
        "dojo/on",
        "dojo/dom",
        "esri/Basemap",
        "esri/layers/VectorTileLayer",
        "esri/PopupTemplate",
        "esri/symbols/SimpleFillSymbol",
        "esri/symbols/SimpleMarkerSymbol",
        "esri/symbols/SimpleLineSymbol",
        "dojo/query",
        "dojo/domReady!"
      ],
      function(
        Map, MapView, FeatureLayer, Layer, Field, LayerList, Graphic, Expand,  Home, Track, Search, Extent, Viewpoint, watchUtils, on, dom, Basemap, VectorTileLayer, PopupTemplate, SimpleFillSymbol, SimpleMarkerSymbol, SimpleLineSymbol, dojoQuery
      ) {
        
        // global variables for use later
        var featureLayer, layerExpand, editExpand, searchExpand, queryExpand;

        // feature edit area domNodes
        var editArea, attributeEditing, updateInstructionDiv;
        
        // *****************************************************        
        // CREATE MAP AND ADD STYLED LAYERS
        
        var basemap = new Basemap({
            baseLayers: [
                new VectorTileLayer({
                portalItem: {
                    id: "7b0d179a4df74ce284fc99e185aa6b34" // Custom Designed Tiles
                    }
                })
            ]
        });
        
        var map = new Map({
          basemap: basemap
        });

        // initial extent of the view and home button
        var northExtent = new Extent({
          xmin: -8727579.889599169,
          xmax: -8693641.849040538,
          ymin: 4673330.31752808,
          ymax: 4711548.831670683,
          spatialReference: 102100
        }); 
        var centralExtent = new Extent({
          xmin: -8749440.879688738,
          xmax: -8702049.922151912,
          ymin: 4625633.611878112,
          ymax: 4672871.695358369,
          spatialReference: 102100
        });
        var southExtent = new Extent({
          xmin: -8781544.431568524,
          xmax: -8734612.096201409,
          ymin: 4585427.7350000935,
          ymax: 4634653.181215766,
          spatialReference: 102100
        });
        
        var initialExtent = new Extent({
          xmin: -8782996.735105887,
          xmax: -8691272.30116372,
          ymin: 4582676.001981874,
          ymax: 4716593.675537439,
          spatialReference: 102100
        });
        
        // style for enterprise zones
        var boundaryR={
            type: "simple",
            symbol: {
                type: "simple-fill",
                color: "#579C87",
                style: "solid",
                outline: {
                    width: 0.5,
                    color: "#32594D"
                }
            },  
        };
        
        // style for technology zones
        var aoiR={
            type: "unique-value",
            field: "aoiType",
            //defaultSymbol: {type: "simple-fill"},
            uniqueValueInfos: [{
                value: "Wilderness Area",
                symbol: {
                    type:"simple-fill",
                    color:"#579C87",
                    outline: {width:0}
                }
            },{
                value: "Campground",
                symbol: {
                    type:"picture-fill",
                    url: "img/tri.png",
                    width:7,
                    height:7
                }
            },{
                value: "No Camping Area",
                symbol: {
                    type:"picture-fill",
                    url: "img/x.png",
                    width:7,
                    height:7
                }
            },{
                value: "Picnic Area",
                symbol: {
                    type:"picture-fill",
                    url: "img/dia.png",
                    width:7,
                    height:7
                }
            },{
                value: "Natural Area",
                symbol: {
                   type:"picture-fill",
                    url: "img/grass.png",
                    width:7,
                    height:7
                }
            },{
                value: "Historical Area",
                symbol: {
                    type:"picture-fill",
                    url: "img/cir.png",
                    width:7,
                    height:7
                }
            },{
                value: "Cemetery",
                symbol: {
                   type:"picture-fill",
                    url: "img/hcir.png",
                    width:7,
                    height:7
                }
            }]
        };
        
        var roadR={
            type: "unique-value",
            field: "SkylineDrive",
            //defaultSymbol: {type: "simple-fill"},
            uniqueValueInfos: [{
                value: "0",
                symbol: {
                    type:"simple-line",
                    join: "round",
                    color:"#BFA648",
                    width: 1
                }
            },{
                value: "1",
                symbol: {
                    type:"simple-line",
                    join: "round",
                    color:"#FCCA46",
                    width: 2
                }
            }]
        };
        
        var trailR={
            type: "unique-value",
            field: "TrailType",
            //defaultSymbol: {type: "simple-fill"},
            uniqueValueInfos: [{
                value: "Hikers Only",
                symbol: {
                    type:"simple-line",
                    join: "round",
                    color:"#143E2B",
                    width: 1,
                    style: "dot"
                }
            },{
                value: "Horse Trail",
                symbol: {
                    type:"simple-line",
                    join: "round",
                    color:"#143E2B",
                    width: 1,
                    style: "dash"
                }
            },{
                value: "Fire Road",
                symbol: {
                    type:"simple-line",
                    join: "round",
                    color:"#143E2B",
                    width: 1,
                    style: "long-dash-dot-dot"
                }
            }]
        };
        
        var poiR={
            type: "unique-value",
            field: "poiType",
            //defaultSymbol: {type: "simple-fill"},
            uniqueValueInfos: [{
                value: "Car Overlook",
                symbol: {
                    type:"picture-marker",
                    url: "img/overlook.jpg",
                    width:15,
                    height:15
                }
            },{
                value: "Parking Area",
                symbol: {
                    type:"picture-marker",
                    url: "img/parking.jpg",
                    width:15,
                    height:15
                }
            },{
                value: "Restroom",
                symbol: {
                    type:"picture-marker",
                    url: "img/restroom.jpg",
                    width:15,
                    height:15
                }
            },{
                value: "Lodge or Cabins",
                symbol: {
                    type:"picture-marker",
                    url: "img/cabin.jpg",
                    width:15,
                    height:15
                }
            },{
                value: "Campground",
                symbol: {
                   type:"picture-marker",
                    url: "img/campground.jpg",
                    width:15,
                    height:15
                }
            },{
                value: "Hiking Shelter",
                symbol: {
                    type:"picture-marker",
                    url: "img/shelter.jpg",
                    width:15,
                    height:15
                }
            },{
                value: "Food Or Store",
                symbol: {
                    type:"picture-marker",
                    url: "img/food.jpg",
                    width:15,
                    height:15
                }
            },{
                value: "Historical Site",
                symbol: {
                    type:"picture-marker",
                    url: "img/historic.jpg",
                    width:15,
                    height:15
                }
            },{
                value: "Cemetery",
                symbol: {
                    type:"picture-marker",
                    url: "img/cemetery.jpg",
                    width:15,
                    height:15
                }
            },{
                value: "Picnic Area",
                symbol: {
                    type:"picture-marker",
                    url: "img/picnic.jpg",
                    width:15,
                    height:15
                }
            },{
                value: "Hiking Viewpoint",
                symbol: {
                    type:"picture-marker",
                    url: "img/view.jpg",
                    width:15,
                    height:15
                }
            },{
                value: "Visitor Info",
                symbol: {
                    type:"picture-marker",
                    url: "img/info.jpg",
                    width:15,
                    height:15
                }
            },{
                value: "Waterfall",
                symbol: {
                    type:"picture-marker",
                    url: "img/waterfall.jpg",
                    width:15,
                    height:15
                }
            },{
                value: "Gas Station",
                symbol: {
                    type:"picture-marker",
                    url: "img/gas.jpg",
                    width:15,
                    height:15
                }
            }]
        };
        
        var thR= {
            type: "simple",
            symbol:{
                type:"picture-marker",
                url: "img/trailhead.jpg",
                width:15,
                height:15
            }
        };
        
        var visRecR= {
            type: "unique-value",
            field: "approved",
            uniqueValueInfos: [{
                value: "0",
                symbol: {
                    type:"simple-marker",
                    color: "#743A89",
                    size:5,
                    outline: {color: "#FFFFFF"}         
                }
            },{
                value: "1",
                symbol: {
                    type:"picture-marker",
                    url: "img/visRec.jpg",
                    width:15,
                    height:15
                }
            }]
        };
        
        
        //POPUP TEMPALTES
        var aoiP = new PopupTemplate({
                title: "{aoiType} - {aoiName}",
                content: "{aoiNotes}"
            });
        var poiP = new PopupTemplate({
                title: "{poiType} - {poiName}",
                content: "<b>District:</b> {ParkSection} <br/> {poiNotes} <br/> <img src='{PhotoURL}'>"
            });
        var trailsP = new PopupTemplate({
                title: "Trail - {TrailName}",
                content: "<b>Type:</b> {TrailType} <br/> <b>Section Length:</b> {TrailLength} miles",
                fieldInfos: [{
                    fieldName: "TrailLength",
                    format: {
                        digitSeparator: true,
                        places:1
                    }
                }]
            });
        var trailheadsP = new PopupTemplate({
                title: "TrailHead - {TrailName}",
                content: "{TrailNotes}"
            });
        
               
        // map instance
        var view = new MapView({
          container: "viewDiv",
          map: map,
          extent: initialExtent,
          constraints:{
              rotationEnabled: false
          }
        });
        
        var boundary = new FeatureLayer({
            url:"https://devmaps.vedp.org/arcgis/rest/services/aks_fp/snp_data/MapServer/6",
            visible: true,
            renderer: boundaryR,
            opacity: 0.4,
            title: "Park Boundary",
            //popupTemplate: {
            //    title: "{parkSection}",
            //}
        });
        var aoi = new FeatureLayer({
            url:"https://devmaps.vedp.org/arcgis/rest/services/aks_fp/snp_data/MapServer/5",
            visible: true,
            renderer: aoiR,
            opacity: 0.4,
            title: "Area Of Interest",
            popupTemplate: aoiP
        });
        var trails = new FeatureLayer({
            url:"https://devmaps.vedp.org/arcgis/rest/services/aks_fp/snp_data/MapServer/4",
            visible: true,
            renderer: trailR,
            //opacity: 0.4,
            title: "Trails",
            popupTemplate: trailsP
        });
        var roads = new FeatureLayer({
            url:"https://devmaps.vedp.org/arcgis/rest/services/aks_fp/snp_data/MapServer/3",
            visible: true,
            renderer: roadR,
            //opacity: 0.4,
            title: "Roads",
            popupTemplate: {
                title: "Road - {RoadName}",
                content: "Open to Public: {PublicAccess}"
            }
        });
        var trailheads = new FeatureLayer({
            url:"https://devmaps.vedp.org/arcgis/rest/services/aks_fp/snp_data/MapServer/1",
            visible: true,
            renderer: thR,
            //opacity: 0.4,
            title: "Trail Heads",
            popupTemplate: trailheadsP
        });
        var poi = new FeatureLayer({
            url:"https://devmaps.vedp.org/arcgis/rest/services/aks_fp/snp_data/MapServer/0",
            visible: true,
            renderer: poiR,
            //opacity: 0.4,
            title: "Point of Interest",
            popupTemplate: poiP
        });
        
        //additional attribution
        roads.watch("loaded", function(){
          watchUtils.whenFalseOnce(view, "updating", function(){
             var attribs = dojoQuery(".esri-attribution__sources")[0];
             console.info(attribs);
             attribs.innerHTML += ", OpenStreetMap.org contributors, Virginia DCR";
          });
        });

        
        map.add(boundary); 
        map.add(aoi);
        map.add(trails);
        map.add(roads);
        map.add(trailheads);
        map.add(poi);
        
        
        
        // add an editable featurelayer rest end point
        Layer.fromArcGISServerUrl({
            url: "https://devmaps.vedp.org/arcgis/rest/services/aks_fp/snp_data/FeatureServer/2",
            properties: {
                title: "Visitor Recommendations",
                renderer: visRecR,
                //outFields: ["*"]
                popupTemplate: {
                    title: "Visitor Recommendation - {placeName}",
                    content: "<i><q>{vrNotes}</q></i> <br/> <b>District:</b> {parkSection}"
                }
            }
          }).then(addLayer) 
          .catch(handleLayerLoadError);
            
        setupEditing();
        setupView();

        function addLayer(lyr) {
            featureLayer = lyr;
            map.add(lyr);
        }  
        
    
         
        
        // *****************************************************     
        // APPLY EDITS FUNCTION TO SUBMIT NEW DATA TO DB
        function applyEdits(params) {
          unselectFeature();
          var promise = featureLayer.applyEdits(params);
          editResultsHandler(promise);
        } 

        // applyEdits promise resolved successfully
        // query the newly created feature from the featurelayer
        // set the editFeature object so that it can be used
        // to update its features.
 
        function editResultsHandler(promise) {
          promise
            .then(function(editsResult) {
              var extractObjectId = function(result) {
                return result.objectId;
              };

              // get the objectId of the newly added feature
              if (editsResult.addFeatureResults.length > 0) {
                var adds = editsResult.addFeatureResults.map(
                  extractObjectId);
                newIncidentId = adds[0];

                selectFeature(newIncidentId);
              }
              
            })
            .catch(function(error) {
              console.log("===============================================");
              console.error("[ applyEdits ] FAILURE: ", error.code, error.name,
                error.message);
              console.log("error = ", error);
            });
        }

        
        // *****************************************************
        // HITTEST HIGHLIGHT SELECTED FEATURE
        
        
        var polyHighlight = new SimpleFillSymbol({
            color: [0, 0, 0, 0],
            style: "solid",
            outline: {
                color: [0, 255, 255, 1],
                width: "2px"
            }
        });
        
        var lineHighlight = new SimpleLineSymbol({
            color: [0, 255, 255, 1],
            width: 5
        });
        
        var pointHighlight = new SimpleMarkerSymbol({
            color: [0, 0, 0, 0],
            size: 17,
            style: "square",
            outline: {
              color: [0, 255, 255, 1],
              width: "2px"
            }
        });
        
        view.on("click", function(event) { //hitTest used to create a selection graphic for the popup
            var screenPoint = {
                x: event.x,
                y: event.y
            };
            view.hitTest(screenPoint)
                .then(getGraphics);
        });
        function getGraphics(response) {
            view.graphics.removeAll();
            var resultGraphic = response
            
            if (resultGraphic.results.length > 0) {
                var selectionGraphic = resultGraphic.results[0].graphic.clone();
                if (selectionGraphic.geometry.type == "polygon"){
                   selectionGraphic.symbol = polyHighlight; 
                } else if (selectionGraphic.geometry.type == "polyline"){
                    selectionGraphic.symbol = lineHighlight;
                } else if (selectionGraphic.geometry.type == "point"){
                    selectionGraphic.symbol = pointHighlight; 
                };  
                view.graphics.add(selectionGraphic);
            }
 
        }
        
        view.popup.watch("visible", function(visible) { //watch for the vis on the popup, if false remove graphics
            if (visible == false) {
               view.graphics.removeAll();
            }
            //console.log("popup visible: ", visible);
         }); 
        
        // *****************************************************
        // LISTEN TO CLICK EVENT ON THE VIEW
        // select if there is an intersecting feature on view click
        
        view.on("click", function(evt) {
          unselectFeature();
          view.hitTest(evt).then(function(response) {
           
              if (response.results.length > 0 && response.results[0].graphic) {
                //grab the feature/attributes that was clicked on
                var feature = response.results[0].graphic;
                selectFeature(feature.attributes[featureLayer.objectIdField]); 
                if (feature.attributes.approved == 0){
                    feature.popupTemplate= new PopupTemplate({
                        title: "<i>Visitor Recommendation- Verification Pending</i>",
                        content: "Check back later for recommendation"
                    })
                } else if (feature.attributes.approved == 1){
                    feature.popupTemplate= new PopupTemplate({
                        title: "Visitor Recommendation - {placeName}",
                        content: "<i><q>{vrNotes}</q></i> <br/> <b>District:</b> {parkSection}"
                    })
                }
           }
            
          });
        });
        

        // *****************************************************
        // SELECT NEWLY CREATED FEATURE // SELECT EXISTING FEATURE
        function selectFeature(objectId) {
          // symbol for the selected feature on the view
            var selectionSymbol = {
            type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
            color: [0, 0, 0, 0],
            size: 17,
            outline: {
              color: [0, 0, 0, 0],
              width: "0px"
            }
          };
          var query = featureLayer.createQuery();
          query.where = featureLayer.objectIdField + " = " + objectId;
          
          // symbolize feature  with the selection symbol renderer
          featureLayer.queryFeatures(query).then(function(results) {
            if (results.features.length > 0) {
              editFeature = results.features[0];
              editFeature.symbol = selectionSymbol;
              view.graphics.add(editFeature);
            }
          });
        }

        // *****************************************************
        // hide attributes update and delete part when necessary
        // *****************************************************
        function unselectFeature() {
          attributeEditing.style.display = "none";
          //updateInstructionDiv.style.display = "block";     
            
          placeName.value = null;
          rec.value = null;
          view.graphics.removeAll();
        }

        // *****************************************************
        // SET UP VIEW AND ADD BUTTONS AND WIDGETS
        function setupView() {
          // set home button view point to initial extent
            var homeButton = new Home({
                view: view,
                viewpoint: new Viewpoint({
                    targetGeometry: initialExtent
                })
            });
            
            var track = new Track({
                viewModel:{
                    view:view,
                    scale: 100000
                }
            });

            // layer list
            var layerList = new LayerList({
                view: view,  
                listItemCreatedFunction: function(event){
                    var item = event.item;
                    
                    if (item.title === "Trail Heads"){
                        item.open = true;
                        item.panel = {
                            content: document.getElementById("th"),
                            open: true
                        }
                    } else if (item.title === "Point of Interest"){
                        item.open = true;
                        item.panel = {
                            content: document.getElementById("poi"),
                            open: true
                        }
                    } else if (item.title === "Visitor Recommendations"){
                        item.open = true;
                        item.panel = {
                            content: document.getElementById("rec"),
                            open: true
                        }
                    } else if (item.title === "Roads"){
                        item.open = true;
                        item.panel = {
                            content: document.getElementById("road"),
                            open: true
                        }
                    } else if (item.title === "Trails"){
                        item.open = true;
                        item.panel = {
                            content: document.getElementById("trail"),
                            open: true
                        }
                    }
                }
            });
            
            // expand layer list
            layerExpand = new Expand({
                expandIconClass: "esri-icon-layers",
                expandTooltip: "Turn on and off Map Layers",
                expanded: false,
                view: view,
                content: layerList,
                mode: "floating", 
                group:"top-left"
                });
            

            // expand widget for edit area
            editExpand = new Expand({
                expandIconClass: "esri-icon-edit",
                expandTooltip: "Add a Visitor Recommendation",
                expanded: false,
                view: view,
                content: editArea,
                mode: "floating",
                group:"top-left"
            });
            
            // expand widget for query
            var query = document.getElementById("info-div");
            queryExpand = new Expand ({
                expandIconClass: "esri-icon-filter",
                expandTooltip: "Filter Points of Interest",
                expanded: false,
                view: view,
                content: query,
                mode: "floating",
                group:"top-left"
            });
            
            // search widget
            var searchWidget = new Search({
                view:view,
                allPlaceholder: "Search for SNP Places",
                locationEnabled: false,
                sources: [{
                    featureLayer: poi,
                    resultGraphicEnabled: true,
                    resultGraphic: pointHighlight,
                    outFields: ["*"],
                    popupTemplate: poiP
                }, {
                    featureLayer:aoi,
                    resultGraphicEnabled: true,
                    resultGraphic: pointHighlight,
                    outFields: ["*"],
                    popupTemplate: aoiP
                }, {
                    featureLayer: trailheads,
                    resultGraphicEnabled: true,
                    resultGraphic: pointHighlight,
                    outFields: ["*"],
                    popupTemplate: trailheadsP
                }, {
                    featureLayer:trails,
                    resultGraphicEnabled: true,
                    resultGraphic: lineHighlight,
                    outFields: ["*"],
                    popupTemplate: trailsP
                }]
            });
            // search expand
            searchExpand = new Expand({
                expandIconClass: "esri-icon-search",
                expandTooltip: "Search for SNP Places",
                view: view,
                content: searchWidget,
                mode: "floating",
                group:"top-left"
            });
            
            // add all widgets to view 
            view.ui.move( "zoom", "bottom-right");
            view.ui.add([homeButton, track, layerExpand], "bottom-right")
            view.ui.add([searchExpand, queryExpand, layerExpand, editExpand],"top-left");
        }
        
        
        
        // *****************************************************
        // ON FILTER CHANGE ACTION      
        // on filter button click
        $('#filterBtn').click(function(){
            checkVals = getValue();
            filterVal = $('#filter').val();
            console.log("poiType IN ('" + checkVals.join("', '") + "')")
            console.log("poiType IN ('" + checkVals.join("', '") + "') AND ParkSection = '" + filterVal + "'")
            if (filterVal == ''){
                poi.definitionExpression = "poiType IN ('" + checkVals.join("', '") + "')";
                view.extent = initalExtent;
            } else if (filterVal == "north") {
                poi.definitionExpression = "poiType IN ('" + checkVals.join("', '") + "') AND ParkSection = 'north'"; 
                view.extent = northExtent;
            } else if (filterVal == "central") {
                poi.definitionExpression = "poiType IN ('" + checkVals.join("', '") + "') AND ParkSection = 'central'";
                view.extent = centralExtent;
            } else if (filterVal == "south") {
                poi.definitionExpression = "poiType IN ('" + checkVals.join("', '") + "') AND ParkSection = 'south'"; 
                view.extent = southExtent;
            }
            queryExpand.iconNumber = 1;
            poi.visible = true;
            queryExpand.collapse();
        });
        
        $('#clearFilterBtn').click(function(){
            poi.definitionExpression = "";
            view.extent = initialExtent;
            queryExpand.iconNumber = 0;
            queryExpand.collapse();
            $('.chk:checked').each(function(){
                this.checked = false;
            });
            $('#filter').val('');
        });
        
        function getValue(){
            var chkArray = [];
            $(".chk:checked").each(function(){
                chkArray.push($(this).val());
            });
            return chkArray;
        };
        
        
        

        // *****************************************************
        // SET UP FOR EDITING
        function setupEditing() {
          // input boxes for the attribute editing
          editArea = dom.byId("editArea");
          updateInstructionDiv = dom.byId("updateInstructionDiv");
          attributeEditing = dom.byId("featureUpdateDiv");        
          placeName = dom.byId("placeName");
          rec = dom.byId("vrNotes");

          // *****************************************************
          // BTN UPDATE CLICK EVENT
          // update attributes of selected feature
          on(dom.byId("btnUpdate"), "click", function(evt) {
            if (editFeature) {
              editFeature.attributes["placeName"] = placeName.value;
              editFeature.attributes["vrNotes"] = rec.value;
              // if nothing was entered delete the added point
              if ((placeName.value == "")&&(rec.value == "")){
                    var edits = {
                        deleteFeatures: [editFeature]
                      }
                  }else{ 
                      var edits = {
                        updateFeatures: [editFeature]
                      }
                  };
              applyEdits(edits);
              //close panel on mobile  
              if( /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
                editExpand.collapse();
              };
            }
          });

          // *****************************************************
          // BTNADDFEATURE CLICK EVENT
          // create a new feature at the click location
          on(dom.byId("btnAddFeature"), "click", function() {
            //close panel on mobile 
            if( /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
                editExpand.collapse();
            };
            featureLayer.definitionExpression = ""
            unselectFeature();
            on.once(view, "click", function(event) {
              //open panel on mobile
              if( /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
                    editExpand.expand();
                };
              event.stopPropagation();

              if (event.mapPoint) {
                point = event.mapPoint.clone();
                point.z = undefined;
                point.hasZ = false;

                newIncident = new Graphic({
                  geometry: point,
                  attributes: {}
                });

                var edits = {
                  addFeatures: [newIncident]
                };

                applyEdits(edits);

                // ui changes in response to creating a new feature
                // display feature update and delete portion of the edit area
                attributeEditing.style.display = "block";
                //updateInstructionDiv.style.display = "none";
                dom.byId("viewDiv").style.cursor = "auto";
              }
              else {
                console.error("event.mapPoint is not defined");
              }
            });

            // change the view's mouse cursor once user selects
            // a new incident type to create
            dom.byId("viewDiv").style.cursor = "crosshair";
            editArea.style.cursor = "auto";
          });
            
            
            
        }
        // report if the layer failed to load
        function handleLayerLoadError(err) {
          console.log("Layer failed to load: ", err);
        }        
    });
});