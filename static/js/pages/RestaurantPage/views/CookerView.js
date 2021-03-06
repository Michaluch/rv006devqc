define([
        "underscore",
        "backbone",
        "jquery",
        "form2js",
        "pages/RestaurantPage/models/DishesModel",
        "pages/RestaurantPage/models/CategoryModel",
        "pages/RestaurantPage/collections/CategoriesCollection",
        "pages/RestaurantPage/collections/DishesCollection",
        "pages/RestaurantPage/collections/StatusesCollection",
        "text!pages/RestaurantPage/templates/CookerTemplate.html",
        'text!pages/RestaurantPage/templates/DishesTemplate.html',
        'text!pages/RestaurantPage/templates/EditDishTemplate.html',
        'text!pages/RestaurantPage/templates/CategoriesTemplate.html',
        'text!pages/RestaurantPage/templates/DishRowTemplate.html',
        'text!pages/RestaurantPage/templates/AddDishTemplate.html',
        'text!pages/RestaurantPage/templates/AddCategoryTemplate.html',
        'text!pages/RestaurantPage/templates/CategoryBlockTemplate.html',
        'text!pages/RestaurantPage/templates/AdvancedSearchTemplate.html'
    ],

    function(_,
        Backbone,
        $,
        form2js,
        DishesModel,
        CategoryModel,
        CategoriesCollection,
        DishesCollection,
        StatusesCollection,
        CookerTemplate,
        DishesTemplate,
        EditDishTemplate,
        CategoriesTemplate,
        DishRowTemplate,
        AddDishTemplate,
        AddCategoryTemplate,
        CategoryBlockTemplate,
        AdvancedSearchTemplate
    ) {
        return Backbone.View.extend({

            events: {
                'click #addmenu': 'store',
                'click #view_category': 'viewCategory',
                'click #dishDrop': 'dishDrop',
                'click #edit_dish': 'editDish',
                'click #save_dish': 'saveDish',
                'click #resetter': 'resetSearch',
                'click #popup__toggle': 'popUp',
                'click #search_btn': 'searchDishes',
                'click #advanced_search_popup': 'advancedSearchPopup', 
                'click #advanced_search': 'advancedSearch', 
                'keyup #search': 'showRes',
                'click #addCat': 'addCat', 
                'click #cat__toggle': 'catPopUp',
                'click #is_active_status': 'isActiveStatus',
                'click #cancel_edit_dish': 'removeEditDishModal',
                'mouseenter #menu_trigger': 'addDialog',
                'mouseleave #menu_trigger': 'remDialog',
                'mouseenter #popup__toggle': 'addDialog',
                'mouseleave #popup__toggle': 'remDialog',
                'mouseenter #cat__toggle': 'addDialog',
                'mouseleave #cat__toggle': 'remDialog',
                'mouseenter #bulk_trigger': 'bulkDialog',
                'mouseleave #bulk_trigger': 'remBulkDialog',
                'mouseenter #remove_selected, #change_status, #change_category': 'bulkDialog',
                'mouseleave #remove_selected, #change_status, #change_category': 'remBulkDialog'
            },

            el: '#content',

            initialize: function() {
                categories = new CategoriesCollection();
                statuses = new StatusesCollection();
                var today = new Date();

            },

            store: function(event) {
                var data = form2js('update_menu_form', '.', false);
                this.checkFormDish(data);
                var model = new DishesModel(data);
                var self = this;
                var isSave = model.save({},{
                    success: function(m, response) {
                        if(isSave) { 
                            if(parseInt(data.id_category) === parseInt(dishes.id)) {                        
                                model.set('id', parseInt(response));
                                if (parseInt(data.id_status) === 1) {
                                    model.set('status', 'Active');
                                    self.prependDishRow(model.toJSON());
                                } else {
                                    model.set('status', 'Inactive');
                                    self.appendDishRow(model.toJSON());
                                }
                            }
                            dishes.add(model);
                            self.removeEditDishModal();    
                        }                     
                    }}); 
            },

            checkFormDish: function(data) {
                if (data.price.charAt(0) === '.') { data.price = '0' + data.price; }
                if (_.isNull(data.id_status)) { data.id_status = 2; }
            },

            saveDish: function(event) {
                var data = form2js('update_menu_form', '.', false);
                this.checkFormDish(data);
                if(data.id_category != dishModel.get('id_category')){
                    if(dishModel.save(data)) {
                        dishes.remove(dishModel);
                        this.removeDishRow(eventModel);
                        this.removeEditDishModal();
                        return;
                    }
                }
                if (data.id_status == 1 && dishModel.get('status') === 'Inactive') {
                    dishModel.set('status', 'Active') ;
                }
                if(dishModel.save(data)){
                    if (data.id_status == 2 && dishModel.get('status') === 'Active') {
                        dishModel.set('status', 'Inactive') ;
                        this.removeDishRow(eventModel);
                        this.appendDishRow(dishModel.toJSON());
                    }
                    this.removeEditDishModal();
                    var template = _.template(DishRowTemplate, dishModel.toJSON());
                    $(template).replaceAll($(eventModel.target).parent().parent());
                }
            },

            dishDrop: function(event) {
                var dish = dishes.get(event.target.value);
                if (dish.get('status') !== 'Inactive') {
                    this.removeDishRow(event);
                    dish.set({
                        'status': 'Inactive',
                        'id_status': 2
                    });
                    this.appendDishRow(dish.toJSON());
                    dish.clone().destroy();
                }
            },

            editDish: function(event) {
                self = this;
                dishModel = dishes.get(event.target.value);
                $.when(statuses.fetch()).done(function() {
                    self.$el.append(_.template(EditDishTemplate, dishModel.toJSON()));
                    $('#edit_dish_template').css('display', 'block');
                });
                eventModel = event;
            },

            isActiveStatus: function(event) {
                var statusId = event.target.value;
                event.target.value = statusId == 1 ? 2 : 1;
            },

            prependDishRow: function(obj) {
                $('#dishes').prepend(_.template(DishRowTemplate, obj));
            },
            appendDishRow: function(obj) {
                $('#dishes').append(_.template(DishRowTemplate, obj));
            },

            removeEditDishModal: function(event) {
                $('#edit_dish_template').remove();
            },

            removeDishRow: function(event) {
                $(event.target).parent().parent().remove();
            },

            isSelectedCategory: function(val) {
                if (typeof val === 'string') {
                    selected_category_id = val;
                    return true;
                } else {
                    if (selected_category_id !== val.target.value) {
                        selected_category_id = val.target.value;
                        return true;
                    } else {
                        return false;
                    }
                }
            },

            viewCategory: function(event) {
                if (this.isSelectedCategory(event)) {
                    dishes = new DishesCollection(selected_category_id);
                    $.when(dishes.fetch()).done(function() {
                        $('#dishes').html(_.template(DishesTemplate));
                    });
                }
            },

            resetSearch: function(event) {
                $("#search").val('');
                this.showRes(event);
                this.viewCategory(selected_category_id); // set last selected category
            },

            popUp: function(event) {
                this.$el.append(_.template(AddDishTemplate));
                $('#edit_dish_template').css('display', 'block');
            },

            searchDishes: function(event) {
                var str = "search/" + $('#search').val();
                dishes = new DishesCollection(str);
                $.when(dishes.fetch()).done(function() {
                    $('#dishes').html(_.template(DishesTemplate));
                });
            },
            
            advancedSearch: function(event) {
                var data = form2js('advanced_search_form', '.', true);
                if (data.id_category == 'All') delete data.id_category;
                var str = 'advanced_search/' + JSON.stringify(data);
                dishes = new DishesCollection(str);
                $.when(dishes.fetch()).done(function() {
                    $('#dishes').html(_.template(DishesTemplate));
                });
                $('.popup__overlay').remove();
            },

            advancedSearchPopup: function(event) {
                var self = this;
                $.when(statuses.fetch()).done(function() {
                    self.$el.append(_.template(AdvancedSearchTemplate));
                    $('.popup__overlay').css('display', 'block');
                });
            },

            showRes: function(event) {
                if ($(event.target).val().length > 0) {
                    $('#resetter').css({
                        display: 'inline-block'
                    });
                } else {
                    $('#resetter').css({
                        display: 'none'
                    });
                }

            },

            /*Method for add new category and view her on page*/
            addCat: function(event) {
                var data = form2js('catform', '.', true);
                var categoryModel = new CategoryModel(data); 
                var isSave = categoryModel.save({},{
                    success: function(model, response) {
                        if (isSave) {
                            categoryModel.set('id', parseInt(response));
                            categories.add(categoryModel);
                            $('.cat__overlay').remove();
                            $('#category_block').append(_.template(CategoryBlockTemplate, categoryModel.toJSON()));
                        }
                    }
                });
            },
  
            catPopUp: function(event) {
                this.$el.append(_.template(AddCategoryTemplate));                
                $('.cat__overlay').css('display', 'block');
              },

            addDialog: function(event) {
            	$('#popup__toggle').css('display', 'inline-block');
                $('#cat__toggle').css('display', 'inline-block');
            },

            bulkDialog: function(event) {
                $('#remove_selected').css('display', 'inline-block');
                $('#change_status').css('display', 'inline-block');
                $('#change_category').css('display', 'inline-block');
            },

            remBulkDialog: function(event) {
                $('#remove_selected').css('display', 'none');
                $('#change_status').css('display', 'none');
                $('#change_category').css('display', 'none');
            },

            remDialog: function(event) {
                $('#popup__toggle').css('display', 'none');
                $('#cat__toggle').css('display', 'none');
            },

            render: function() {
                var self = this;
                $.when(categories.fetch()).done(function() {
                    self.$el.html(_.template(CookerTemplate));
                    self.$el.append(_.template(CategoriesTemplate));
                    selected_category_id = categories.models[0].id;
                    self.viewCategory(selected_category_id.toString());
                });
            }
        });
    });