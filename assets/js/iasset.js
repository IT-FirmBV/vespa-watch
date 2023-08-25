(function($) {
    $(document).ready(function () {
        let map, infoWindow, incr = 0, marker, requiredFields = [], requiredPhotos = [], fileIds = [], checkAndRadioIds = [], mapProp;

        // Function to initialize map
        function initMap() {
            mapProp = {
                center:new google.maps.LatLng(50.8,4.5),
                zoom:7,
            };

            map = new google.maps.Map(document.getElementById("googleMap"),mapProp);
            infoWindow = new google.maps.InfoWindow();
        }

        // It will add the marker on your current location.
        function addMarker(location) {
            marker = new google.maps.Marker({
                position: location,
                map: map,
                animation: google.maps.Animation.DROP,
                draggable: true,
            });
        }

        const form = document.getElementById('nest-report-form');

        form.addEventListener('keypress', function(e) {
            if (e.keyCode === 13) {
                e.preventDefault();
            }
        });

        // This is for the GPS field, get current location so the input is filled in. You can also move the map marker to change location.
        // You must use your own Google Maps API key in the index.html file.
        function getLocation(selector, close = false) {
            if (close) {
                incr = 0;

                $('#' + selector).siblings('#googleMap').addClass('d-none');
                $('#' + selector).siblings('.pac-card').addClass('d-none');
                $('#' + selector).siblings('.disclaimer').addClass('d-none');
                $('#' + selector).siblings('.close-button').addClass('d-none');

                if (marker) marker.setMap();
            } else {
                $('#' + selector).siblings('#googleMap').removeClass('d-none');
                $('#' + selector).siblings('.pac-card').removeClass('d-none');
                $('#' + selector).siblings('.disclaimer').removeClass('d-none');
                $('#' + selector).siblings('.close-button').removeClass('d-none');

                const card = document.getElementById("pac-card");
                const input = document.getElementById('pac-input');

                const options = {
                    fields: ["formatted_address", "geometry", "name"],
                    strictBounds: false,
                };

                const autocomplete = new google.maps.places.SearchBox(input, options);

                // Bind the map's bounds (viewport) property to the autocomplete object,
                // so that the autocomplete requests use the current map bounds for the
                // bounds option in the request.
                autocomplete.bindTo("bounds", map);


                autocomplete.addListener("places_changed", () => {
                    marker.setVisible(false);

                    const places = autocomplete.getPlaces();

                    if (places.length == 0) {
                        $('#' + selector).attr('value', '');

                        return;
                    }

                    // If the place has a geometry, then present it on a map.
                    if (places[0].geometry.viewport) {
                        map.fitBounds(places[0].geometry.viewport);
                    } else {
                        map.setCenter(places[0].geometry.location);
                        map.setZoom(17);
                    }

                    marker.setPosition(places[0].geometry.location);
                    marker.setVisible(true);

                    $('#' + selector).attr('value', 'POINT(' + places[0].geometry.location.lat() + ' ' + places[0].geometry.location.lng() + ')');
                });

                if (incr === 0) $('#' + selector).siblings('.loader').removeClass('d-none');

                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            let pos = {
                                lat: position.coords.latitude,
                                lng: position.coords.longitude,
                            };

                            window.setTimeout(() => {
                                if (typeof pos['lat'] === 'undefined' || typeof pos['lng'] === 'undefined') {
                                    pos = {
                                        lat: 50.8,
                                        lng: 4.5
                                    }
                                }

                                if (incr === 0) {
                                    infoWindow.open(map);
                                    map.setCenter(pos);

                                    addMarker(pos)

                                    $('#' + selector).siblings('.loader').addClass('d-none');
                                    $('#' + selector).attr('value', 'POINT(' + pos.lat + ' ' + pos.lng + ')');

                                    incr++;
                                }

                                google.maps.event.addListener(marker, 'dragend', function (marker) {
                                    pos = marker.latLng;

                                    $('#' + selector).attr('value', 'POINT(' + pos.lat() + ' ' + pos.lng() + ')');
                                });
                            }, 5000)
                        }, () => {
                            let pos = {
                                lat: 50.8,
                                lng: 4.5
                            }

                            if (incr === 0) {
                                infoWindow.open(map);
                                map.setCenter(pos);

                                addMarker(pos)

                                $('#' + selector).siblings('.loader').addClass('d-none');
                                $('#' + selector).attr('value', 'POINT(' + pos.lat + ' ' + pos.lng + ')');

                                incr++;
                            }

                            google.maps.event.addListener(marker, 'dragend', function (marker) {
                                pos = marker.latLng;

                                $('#' + selector).attr('value', 'POINT(' + pos.lat() + ' ' + pos.lng() + ')');
                            });
                        }
                    );
                } else {
                    // Browser doesn't support Geolocation
                    handleLocationError(false, infoWindow, map.getCenter(), selector);
                }
            }
        }

        // If there is an error for the location it will show on the map.
        function handleLocationError(browserHasGeolocation, infoWindow, pos, selector) {
            infoWindow.setPosition(pos);
            infoWindow.setContent(
                browserHasGeolocation
                    ? "Error: Please allow the location from browser."
                    : "Error: Your browser doesn't support geolocation."
            );
            infoWindow.open(map);
            $('#' + selector).siblings('.loader').addClass('d-none');
        }

        // This fills in the fields for the form based on the API request response.
        function setFields(data) {
            let fieldIds = [];

            data.forEach(function (el) {
                let selector = el.fieldlabel.toLowerCase().replaceAll(' ', '-');
                let label = ['checkbox', 'radio', 'current_user', 'field_group'].includes(el.fieldtype) ? '' : '<label class="form-label" ' +
                    'for="' + selector + '">' + el.fieldlabel + (Boolean(parseInt(el.required)) ? " *" : "") + '</label>';
                let input = '';

                switch (el.fieldtype) {
                    case 'text':
                        let type = 'text'

                        // Temporarily
                        switch(el.info) {
                            case 'tel':
                                type = 'tel';
                                break;
                            case 'email':
                                type = 'email'
                                break;
                            default:
                                type = 'text';
                                break;
                        }

                        input = '<input class="form-control" type="' + type + '" ' +
                            'id="' + selector + '" name="' + selector + '" data-id="' + el.id + '" data-type="' + el.fieldtype + '"' +
                            (Boolean(parseInt(el.required)) ? "required " : "") + ((Boolean(parseInt(el.hidden)) || el.info === "hidden") ? "hidden " : "") +
                            (Boolean(parseInt(el.readonly)) ? "readonly" : "") + '>' +
                            '<div id="' + el.id + '" class="invalid-feedback"></div>';
                        break;
                    case 'location':
                        input = '<input class="form-control" type="text" ' +
                            'id="' + selector + '" name="' + selector + '" data-id="' + el.id + '" data-type="' + el.fieldtype + '" data-location="' + true + '"' +
                            (Boolean(parseInt(el.required)) ? "required " : "") + ((Boolean(parseInt(el.hidden)) || el.info === "hidden") ? "hidden " : "") +
                            (Boolean(parseInt(el.readonly)) ? "readonly" : "") + ' readonly>' +
                            '<div id="' + el.id + '" class="invalid-feedback"></div>' +
                            '<div class="loader text-center mt-2 d-none"><div class="spinner-border" role="status"></div></div>' +
                            '<div class="close-button text-end my-2 d-none"><button class="btn btn-danger" type="button">X</button></div>' +
                            '<div class="d-none d-flex pac-card my-2">' +
                            '<input type="text" class="form-control" id="pac-input" placeholder="Vul locatie in...">' +
                            '</div>' +
                            '<div class="d-none disclaimer my-2"><span class="small">Duid de locatie van het nest aan op de kaart door de pin te verplaatsen of door het adres van de nestlocatie in te geven in de zoekbalk.</span></div>'+
                            '<div id="googleMap" style="width:100%;height:400px;" class="d-none"></div>';
                        break;
                    case 'datetime':
                        input = '<input class="form-control" type="datetime-local" ' +
                            'id="' + selector + '" name="' + selector + '" data-id="' + el.id + '" data-type="' + el.fieldtype + '"' +
                            (Boolean(parseInt(el.required)) ? "required " : "") + ' ' + ((Boolean(parseInt(el.hidden)) || el.info === "hidden") ? "hidden " : "") +
                            (Boolean(parseInt(el.readonly)) ? "readonly " : "") + (Boolean(el.autofill) ?
                                'value="' + new Date().toISOString().split('T')[0] + 'T' + new Date().toLocaleTimeString('nl-NL') + '" ': "") + '>' +
                            '<div id="' + el.id + '" class="invalid-feedback"></div>';
                        break;
                    case 'date':
                        input = '<input class="form-control" type="date" ' +
                            'id="' + selector + '" name="' + selector + '" data-id="' + el.id + '" data-type="' + el.fieldtype + '"' +
                            (Boolean(parseInt(el.required)) ? "required " : "") + ' ' + ((Boolean(parseInt(el.hidden)) || el.info === "hidden") ? " " : "") +
                            (Boolean(parseInt(el.readonly)) ? "readonly" : "") + (Boolean(parseInt(el.autofill)) ?
                                'value="' + new Date().toISOString().split('T')[0] + '" ': "") + '>' +
                            '<div id="' + el.id + '" class="invalid-feedback"></div>';
                        break;
                    case 'photo':
                        fileIds.push(el.id);

                        input = '<input class="form-control" type="file" ' +
                            'id="' + selector + '" name="' + selector + '" accept=".jpg,.jpeg,.png,.gif" data-image="true" data-id="' + el.id + '" data-type="' + el.fieldtype + '"' +
                            (Boolean(parseInt(el.required)) ? "required " : "") + ((Boolean(parseInt(el.hidden)) || el.info === "hidden") ? " hidden " : "") +
                            (Boolean(parseInt(el.readonly)) ? "readonly" : "") + '>' +
                            '<div id="' + el.id + '" class="invalid-feedback"></div>';
                        break;
                    case 'textarea':
                        input = '<textarea class="form-control" ' +
                            'id="' + selector + '" name="' + selector + '" data-id="' + el.id + '" data-type="' + el.fieldtype + '"' +
                            (Boolean(parseInt(el.required)) ? "required " : "") + ((Boolean(parseInt(el.hidden)) || el.info === "hidden") ? " hidden " : "") +
                            (Boolean(parseInt(el.readonly)) ? "readonly" : "") + '></textarea>' +
                            '<div id="' + el.id + '" class="invalid-feedback"></div>';
                        break;
                    case 'select':
                        let options = '<option value="">Selecteer...</option>';

                        el.options.forEach(function (option) {
                            options += '<option value="' + option.key + '">' + (option.value !== "" ? option.value : "Selecteer...") + '</option>'
                        })

                        input = '<select class="form-control" ' +
                            'id="' + selector + '" name="' + selector + '" data-id="' + el.id + '" data-type="' + el.fieldtype + '"' +
                            (Boolean(parseInt(el.required)) ? "required " : "") + ((Boolean(parseInt(el.hidden)) || el.info === "hidden") ? "hidden " : "") +
                            (Boolean(parseInt(el.readonly)) ? "readonly" : "") + '>' +
                            options +
                            '</select>' +
                            '<div id="' + el.id + '" class="invalid-feedback"></div>';
                        break;
                    case 'multiselect':
                        let multiOptions = '';

                        el.options.forEach(function (option) {
                            multiOptions += '<option value="' + option.key + '">' + (option.value !== "" ? option.value : "Selecteer...") + '</option>'
                        })

                        input = '<select class="form-control" ' +
                            'id="' + selector + '" name="' + selector + '" data-id="' + el.id + '" data-type="' + el.fieldtype + '"' +
                            (Boolean(parseInt(el.required)) ? "required " : "") + ((Boolean(parseInt(el.hidden)) || el.info === "hidden") ? "hidden " : "") +
                            (Boolean(parseInt(el.readonly)) ? "readonly" : "") + (el.fieldtype === "multiselect" ? "multiple" : "") + '>' +
                            multiOptions +
                            '</select>' +
                            '<div id="' + el.id + '" class="invalid-feedback"></div>';
                        break;
                    case 'field_group':
                        fieldIds[el.id] = el.options.map(el => parseInt(el['value']));

                        input = '<fieldset id="fieldset_' + el.id + '" class="fieldset row"></fieldset>'
                        break;
                    case 'checkbox':
                        checkAndRadioIds.push(el.id);

                        input = '<div><span class="d-block">'  + el.fieldlabel + (Boolean(parseInt(el.required)) ? " *" : "") + '</span>' +
                            '<input class="form-check-input ms-0 me-2" type="checkbox" ' +
                            'id="' + selector + '" name="' + selector + '" data-id="' + el.id + '" data-type="' + el.fieldtype + '"' +
                            (Boolean(parseInt(el.required)) ? "required " : "") + ((Boolean(parseInt(el.hidden)) || el.info === "hidden") ? "hidden " : "") +
                            (Boolean(parseInt(el.readonly)) ? "readonly" : "") + ' value="1">' +
                            '<label class="form-check-label" for="' + selector + '">' + el.info +
                            '</label><div id="' + el.id + '" class="invalid-feedback"></div></div>';
                        break;
                    case 'radio':
                        let radioOptions = '';

                        checkAndRadioIds.push(el.id);

                        el.options.forEach(function (option) {
                            radioOptions += '<input class="form-check-input ms-0 me-2" type="radio" ' +
                                'id="' + selector + '_' + option.key + '" name="' + selector + '" data-id="' + el.id + '" data-type="' + el.fieldtype + '"' +
                                (Boolean(parseInt(el.required)) ? "required " : "") + ((Boolean(parseInt(el.hidden)) || el.info === "hidden") ? "hidden " : "") +
                                (Boolean(parseInt(el.readonly)) ? "readonly" : "") + ' value="' + option.value + '">' +
                                '<label class="form-check-label me-2 text-capitalize" for="' + selector + '_' + option.key + '">' + option.value + '</label>';
                        })

                        input = '<div><span class="d-block">'  + el.fieldlabel + (Boolean(parseInt(el.required)) ? " *" : "") + '</span>' + radioOptions +
                            '<div id="' + el.id + '" class="invalid-feedback"></div></div>';
                        break;
                    case 'current_user':
                        input = '<input class="form-control" type="text" data-user="true"' +
                            'id="' + selector + '" name="' + selector + '" data-id="' + el.id + '" data-type="' + el.fieldtype + '"' +
                            (Boolean(parseInt(el.required)) ? "required " : "") + ' hidden value="vespawatch.be"' +
                            (Boolean(parseInt(el.readonly)) ? "readonly" : "") + '>' +
                            '<div id="' + el.id + '" class="invalid-feedback"></div>';
                        break;
                }

                if (el.fieldtype !== 'field_group') {
                    $('#nest-report-form').append('<div class="' + (el.fieldtype === 'current_user' || (el.hidden || el.info === "hidden") ? 'd-none' : 'mb-3') + '">' +
                        label +
                        input +
                        '</div>')
                } else {
                    $('#nest-report-form').append(input)
                }
            })

            fieldIds.forEach(function (field, key) {
                field.forEach(function (id) {
                    let field = $("body").find("[data-id='" + id + "']");

                    field.parent().detach().appendTo("#fieldset_" + key);
                })
            })

            $('#nest-report-form').append('<div class="form-submit text-end mt-3">' +
                '<button type="submit" class="btn btn-primary">Indienen</button>' +
                '</div>')

            initMap();

            let locationInputs;

            if (locationInputs = $("[data-location='" + true + "']")) {
                $(document).find(locationInputs).on('click', function() {
                    getLocation(locationInputs.attr('id'))
                });

                $(document).find($('.close-button button')).on('click', function () {
                    getLocation(locationInputs.attr('id'), true)
                });
            }
        }

        $.ajax({
            url: 'https://vespawatch.iasset.nl/api.php?get-fields',
            method: 'GET',
            crossDomain: true,
            contentType:'application/json',
            success: function (res) {
                let data = JSON.parse(res);

                requiredFields = data.filter(e => {
                    return e.required == 1 && e.fieldtype !== 'photo'
                }).map(e => {
                    return parseInt(e.id);
                })

                requiredPhotos = data.filter(e => {
                    return e.required == 1 && e.fieldtype === 'photo'
                }).map(e => {
                    return parseInt(e.id);
                })

                setFields(data)
            }
        });

        $('#nest-report-form').on('submit', function (e) {
            $('.form-submit button').attr('disabled', true);
            
            e.preventDefault()

            let lastIndex = 0;
            let serialisedData = $('#nest-report-form').serializeArray();
            let formData = new FormData();

            $('input').removeClass('is-invalid');
            $('.invalid-feedback').text('');

            serialisedData.forEach((field, index) => {
                formData.append('data[' + index + '][id]', parseInt($('#' + field.name).attr('data-id')));
                formData.append('data[' + index + '][value]', field.value);
                formData.append('data[' + index + '][fieldtype]', $('[name="' + field.name + '"]').attr('data-type'));
                formData.append('data[' + index + '][index]', '0');

                lastIndex = index;
            })

            if (fileIds.length > 0) {
                fileIds.forEach((fieldId, i) => {
                    let f = $("body").find("[data-id='" + fieldId + "']");

                    if (f[0].files[0] || (!f[0].files[0]) && f[0].hasAttribute('required')) {
                        lastIndex += 1;

                        serialisedData.push({
                            name: f[0].getAttribute('name'),
                            value: f[0].value,
                        })

                        formData.append('data[' + lastIndex + '][id]', fieldId);
                        formData.append('data[' + lastIndex + '][value]', f[0].files[0] ?? '');
                        formData.append('data[' + lastIndex + '][fieldtype]', 'photo');
                        formData.append('data[' + lastIndex + '][index]', '0');
                    }
                });
            }

            if (checkAndRadioIds.length > 0) {
                checkAndRadioIds.forEach((boxId, i) => {
                    let f = $("body").find("[data-id='" + boxId + "']");

                    if (f[0].hasAttribute('required')) {
                        lastIndex += 1;

                        serialisedData.push({
                            name: f[0].getAttribute('name'),
                            value: f[0].value,
                        })

                        formData.append('data[' + lastIndex + '][id]', boxId);
                        formData.append('data[' + lastIndex + '][value]', f.is(':checked') === true ? 1 : "");
                        formData.append('data[' + lastIndex + '][fieldtype]',  f.attr('data-type'));
                        formData.append('data[' + lastIndex + '][index]', '0');
                    }
                });
            }

            formData.append('requiredFields', requiredFields)
            formData.append('requiredPhotos', requiredPhotos)

            $.ajax({
                url: 'https://vespawatch.iasset.nl/api.php?post-fields',
                enctype: 'multipart/form-data',
                method: 'POST',
                processData: false,  // tell jQuery not to process the data
                contentType: false,  // tell jQuery not to set contentType
                crossDomain: true,
                data: formData,
                success: function (res, status) {
                    if (status === 'success') {
                        alert('Bedankt voor je melding! Je krijgt een e-mail als deze is gevalideerd.')

                        window.location.href = "https://vespawatch.be/eradicators/";
                    }
                },
                error: function (err) {
                    $('.form-submit button').removeAttr('disabled');

                    let errors = err.responseJSON.error;

                    for (const [key, value] of Object.entries(errors)) {
                        let keyStr = key.split('data.').pop();

                        if (value[0].includes('Invalid email')) {
                            $('#' + serialisedData[keyStr.split('.value')[0]]['name']).addClass('is-invalid').siblings('.invalid-feedback').text('Uw e-mailadres is ongeldig.')
                        } else if (value[0].includes('Invalid phone')) {
                            $('#' + serialisedData[keyStr.split('.value')[0]]['name']).addClass('is-invalid').siblings('.invalid-feedback').text('Uw telefoonnummer is ongeldig.')
                        } else if (value[0].includes('Invalid date')) {
                            $('#' + serialisedData[keyStr.split('.value')[0]]['name']).addClass('is-invalid').siblings('.invalid-feedback').text('Kies een datum in het verleden.')
                        } else {
                            $('#' + serialisedData[keyStr.split('.value')[0]]['name']).addClass('is-invalid').siblings('.invalid-feedback').text('Dit veld is verplicht.')
                        }
                    }
                }
            })
        })
    });
})(jQuery);
