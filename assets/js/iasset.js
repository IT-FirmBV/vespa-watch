(function($) {
    $(document).ready(function () {
        let map, infoWindow, incr = 0, marker, fileIds = [], apiUrl = 'https://apiv2.iasset.nl/', apiToken = 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiJjMjBiNWY2ZS1iNTRhLTExZWEtOWYzZS0wMjQyYWMxYjAwMDIiLCJqdGkiOiJmNDc3ZTE0NmExMmM2ODM4Nzc3YjFlNTBjMWU2NTI4MWU4NzQyM2M0MmMxZjViZDY5YTU1MzVjMWY3N2NiNTQwNGEzN2E4YmJlZmMyMTdjZCIsImlhdCI6MTY3NzE0Mjc1NSwibmJmIjoxNjc3MTQyNzU1LCJleHAiOjE3MDg2Nzg3NTUsInN1YiI6IjUyNDciLCJzY29wZXMiOltdfQ.yE5cWcrLgr_0HwHtk5Y0LhhTnVZ0wreFdO5mALp2C0lMykUkhfgRBjL4aMcDUJRL_aZ4Htxjchk2x8fWqJi9iF6CkLhYy4SOi_RlfoWsj90zdfhOc8qHa39IjezQ8VGSFPMBEMVO_h3Iv_ue5bYEVM9y3IzT71MeHggwV6GXCZFhLYchXkkajFLIoy9wsj6-XW3ZVJVrC_nXDPZe96vE17dAyYF6HG-gxqCnu_QbzNyhuTl_j5r4FzMfaw3zYjWdzjxbryRWHD30FlJDgov8kbq-5e1CJUtqv1YPEElSAb26WzJqbxkxOutDQ_lUr0reiXOdwPIb_o6aAdJE8PRee2_FxlBEk29RcaRu0HCj9UFRMt1Ek3w5f3UellT7P6uHnKvS4q2m98sTWFBRgKg4GGTJ-eU-mOElufMQWLUU1nsVea_ynnEM4Ty1RiafHImGWlJKGh6xAc0cNmEqQk6cBdwEyZA7mZKcaYivJNrd7K6S20NsLfZRJuGs3XHy-cCMtpcFN3Yfmg88as5tt_CqgiscLvXVDHndR1bKrfmimXg0PDVZQUqWzEPLYVlXAs93MDnFO1NMgT_6papuhSY5nV1xj_Ey3r3cw2RJYiPdKcO2AoUH8jswTnMn9HR_LL7MCJvGO_sHTuxagJ248oZX9TRzRVDJhVWhN9HZ54HAyfY';

        // Function to initialize map
        function initMap() {
            let mapProp = {
                center:new google.maps.LatLng(51.508742,-0.120850),
                zoom:5,
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

        // This is for the GPS field, get current location so the input is filled in. You can also move the map marker to change location.
        // You must use your own Google Maps API key in the index.html file.
        function getLocation(selector, close = false) {
            if (close) {
                incr = 0;

                $('#' + selector).siblings('#googleMap').addClass('d-none');
                $('#' + selector).siblings('.close-button').addClass('d-none');

                if (marker) marker.setMap();
            } else {
                $('#' + selector).siblings('#googleMap').removeClass('d-none');
                $('#' + selector).siblings('.close-button').removeClass('d-none');

                if (incr === 0) $('#' + selector).siblings('.loader').removeClass('d-none');

                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            let pos = {
                                lat: position.coords.latitude,
                                lng: position.coords.longitude,
                            };

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
                        },
                        () => {
                            handleLocationError(true, infoWindow, map.getCenter(), selector);
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
                let selector = el.label.toLowerCase().replaceAll(' ', '-');
                let label = ['checkbox', 'radio', 'current_user', 'field_group'].includes(el.field_type) ? '' : '<label class="col-form-label" ' +
                    'for="' + selector + '">' + el.label + ':<span>' + (Boolean(parseInt(el.mandatory)) ? ' *' : '') + '</span></label>';
                let input = '';

                switch (el.field_type) {
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

                        input = '<input class="form-control mb-3" type="' + type + '" ' +
                            'id="' + selector + '" name="' + selector + '" data-id="' + el.id + '"' +
                            (Boolean(parseInt(el.mandatory)) ? "required " : "") + (Boolean(parseInt(el.hidden)) ? "hidden " : "") +
                            (Boolean(parseInt(el.readonly)) ? "readonly" : "") + '>' +
                            '<div id="' + el.id + '" class="invalid-feedback"></div>';
                        break;
                    case 'location':
                        input = '<input class="form-control mb-3" type="text" ' +
                            'id="' + selector + '" name="' + selector + '" data-id="' + el.id + '" data-location="' + true + '"' +
                            (Boolean(parseInt(el.mandatory)) ? "required " : "") + (Boolean(parseInt(el.hidden)) ? "hidden " : "") +
                            (Boolean(parseInt(el.readonly)) ? "readonly" : "") + ' readonly>' +
                            '<div id="' + el.id + '" class="invalid-feedback"></div>' +
                            '<div class="loader text-center d-none"><div class="spinner-border" role="status"></div></div>' +
                            '<div class="close-button text-end mb-2 d-none"><button class="btn btn-danger" type="button">X</button></div>' +
                            '<div id="googleMap" style="width:100%;height:400px;" class="d-none"></div>';
                        break;
                    case 'datetime':
                        input = '<input class="form-control mb-3" type="datetime-local" ' +
                            'id="' + selector + '" name="' + selector + '" data-id="' + el.id + '"' +
                            (Boolean(parseInt(el.mandatory)) ? "required " : "") + ' ' + (Boolean(parseInt(el.hidden)) ? "hidden " : "") +
                            (Boolean(parseInt(el.readonly)) ? "readonly " : "") + (Boolean(parseInt(el.autofill)) ?
                                'value="' + new Date().toISOString().split('T')[0] + 'T' + new Date().toLocaleTimeString() + '" ': "") + '>' +
                            '<div id="' + el.id + '" class="invalid-feedback"></div>';
                        break;
                    case 'date':
                        input = '<input class="form-control mb-3" type="date" ' +
                            'id="' + selector + '" name="' + selector + '" data-id="' + el.id + '"' +
                            (Boolean(parseInt(el.mandatory)) ? "required " : "") + ' ' + (Boolean(parseInt(el.hidden)) ? " " : "") +
                            (Boolean(parseInt(el.readonly)) ? "readonly" : "") + (Boolean(parseInt(el.autofill)) ?
                                'value="' + new Date().toISOString().split('T')[0] + '" ': "") + '>' +
                            '<div id="' + el.id + '" class="invalid-feedback"></div>';
                        break;
                    case 'photo':
                        fileIds.push(el.id);

                        input = '<input class="form-control mb-3" type="file" ' +
                            'id="' + selector + '" name="' + selector + '" accept=".jpg,.jpeg,.png,.gif" data-image="true" data-id="' + el.id + '"' +
                            (Boolean(parseInt(el.mandatory)) ? "required " : "") + (Boolean(parseInt(el.hidden)) ? " hidden " : "") +
                            (Boolean(parseInt(el.readonly)) ? "readonly" : "") + '>' +
                            '<div id="' + el.id + '" class="invalid-feedback"></div>';
                        break;
                    case 'textarea':
                        input = '<textarea class="form-control mb-3" ' +
                            'id="' + selector + '" name="' + selector + '" data-id="' + el.id + '"' +
                            (Boolean(parseInt(el.mandatory)) ? "required " : "") + (Boolean(parseInt(el.hidden)) ? " hidden " : "") +
                            (Boolean(parseInt(el.readonly)) ? "readonly" : "") + '></textarea>' +
                            '<div id="' + el.id + '" class="invalid-feedback"></div>';
                        break;
                    case 'select':
                        let options = '';

                        el.options.forEach(function (option) {
                            options += '<option value="' + option.option_value + '">' + (option.option_text !== '' ? option.option_text : 'Selecteer...') + '</option>'
                        })

                        input = '<select class="form-control mb-3" ' +
                            'id="' + selector + '" name="' + selector + '" data-id="' + el.id + '"' +
                            (Boolean(parseInt(el.mandatory)) ? "required " : "") + (Boolean(parseInt(el.hidden)) ? "hidden " : "") +
                            (Boolean(parseInt(el.readonly)) ? "readonly" : "") + '>' +
                            options +
                            '</select>' +
                            '<div id="' + el.id + '" class="invalid-feedback"></div>';
                        break;
                    case 'field_group':
                        fieldIds[el.id] = el.options.map(el => parseInt(el['option_value']));

                        input = '<fieldset id="fieldset_' + el.id + '" class="fieldset row"></fieldset>'
                        break;
                    case 'checkbox':
                        input = '<label><span class="d-block">'  + el.label + '</span><input class="form-check-input ms-0 me-2 mb-3" type="checkbox" ' +
                            'id="' + selector + '" name="' + selector + '" data-id="' + el.id + '"' +
                            (Boolean(parseInt(el.mandatory)) ? "required " : "") + (Boolean(parseInt(el.hidden)) ? "hidden " : "") +
                            (Boolean(parseInt(el.readonly)) ? "readonly" : "") + ' value="1">' +
                            '<label class="form-check-label" for="' + selector + '">' + el.info +
                            '</label></label>' +
                            '<div id="' + el.id + '" class="invalid-feedback"></div>';
                        break;
                    case 'radio':
                        input = '<label><span class="d-block">'  + el.label + '</span><input class="form-check-input ms-0 me-2 mb-3" type="radio" ' +
                            'id="' + selector + '" name="' + selector + '" data-id="' + el.id + '"' +
                            (Boolean(parseInt(el.mandatory)) ? "required " : "") + (Boolean(parseInt(el.hidden)) ? "hidden " : "") +
                            (Boolean(parseInt(el.readonly)) ? "readonly" : "") + ' value="1">' +
                            '<label class="form-check-label" for="' + selector + '">' + el.info +
                            '</label></label>' +
                            '<div id="' + el.id + '" class="invalid-feedback"></div>';
                        break;
                    case 'current_user':
                        input = '<input class="form-control mb-3" type="text" data-user="true"' +
                            'id="' + selector + '" name="' + selector + '" data-id="' + el.id + '"' +
                            (Boolean(parseInt(el.mandatory)) ? "required " : "") + ' hidden value="vespawatch.be"' +
                            (Boolean(parseInt(el.readonly)) ? "readonly" : "") + '>' +
                            '<div id="' + el.id + '" class="invalid-feedback"></div>';
                        break;
                }

                if (el.field_type !== 'field_group') {
                    $('#meldingen').append('<div class="' + (el.field_type === 'current_user' || el.hidden ? 'd-none' : 'col-md-6 col-12') + '">' +
                        label +
                        input +
                        '</div>')
                } else {
                    $('#meldingen').append(input)
                }
            })

            fieldIds.forEach(function (field, key) {
                field.forEach(function (id) {
                    let field = $("body").find("[data-id='" + id + "']");

                    field.parent().detach().appendTo("#fieldset_" + key);
                })
            })

            $('#meldingen').append('<div class="form-submit text-end mt-3">' +
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

        // The two POST requests for creating a general and sub inspections in iAsset
        $.ajax({
            url: apiUrl + 'custom-inspection-fields',
            headers: {
                'Authorization': apiToken,
                'Api-Version': 1
            },
            data: {
                'inspection_id': 7
            },
            success: function (res) {
                setFields(res.data)
            }
        });

        $('#meldingen').on('submit', function (e) {
            e.preventDefault()

            let lastIndex = 0;
            let serialisedData = $('#meldingen').serializeArray();
            let formData = new FormData();
            console.log(serialisedData);

            serialisedData.forEach((field, index) => {
                formData.append('data[' + index + '][field_id]', parseInt($('#' + field.name).attr('data-id')));
                formData.append('data[' + index + '][value]', field.value);
                formData.append('data[' + index + '][index]', '0');

                lastIndex = index;
            })

            if (fileIds.length > 0) {
                fileIds.forEach((fieldId, i) => {
                    let f = $("body").find("[data-id='" + fieldId + "']");

                    if (f[0].files[0]) {
                        lastIndex += 1;

                        formData.append('data[' + lastIndex + '][field_id]', fieldId);
                        formData.append('data[' + lastIndex + '][value]', f[0].files[0] ?? '');
                        formData.append('data[' + lastIndex + '][index]', '0');
                    }
                });
            }

            let userData = {
                0: {
                    'field_id': 434,
                    'value': $("[data-user='" + true + "']").val(),
                    'index': 0,
                }
            };

            $.ajax({
                url: apiUrl + 'custom-inspections/data',
                headers: {
                    'Authorization': apiToken,
                    'Api-Version': 1
                },
                method: 'POST',
                data: {
                    data: userData,
                    object_id: 'f9ae8363dda22cec04912d499119699d', // Hardcoded
                    inspection_id: 6 // Hardcoded as this is the inspection ID in iAsset
                },
                success: function (res, status) {
                    if (status === 'success') {
                        formData.append('general_inspection', '6') // Hardcoded
                        formData.append('general_inspection_record', res.data.id) // Hardcoded
                        formData.append('inspection_id', '7') // Hardcoded as this is the inspection ID in iAsset

                        $.ajax({
                            url: apiUrl + 'custom-inspections/data',
                            headers: {
                                'Authorization': apiToken,
                                'Api-Version': 1
                            },
                            enctype: 'multipart/form-data',
                            method: 'POST',
                            processData: false,  // tell jQuery not to process the data
                            contentType: false,  // tell jQuery not to set contentType
                            data: formData,
                            success: function (res, status) {
                                if (status === 'success') {
                                    alert('U heeft het formulier succesvol verzonden!')

                                    window.location.reload()
                                }
                            },
                            error: function (err) {
                                let errors = err.responseJSON.error;

                                for (const [key, value] of Object.entries(errors)) {
                                    let keyStr = key.split('data.').pop();

                                    $('#' + serialisedData[keyStr.split('.value')[0]]['name']).addClass('is-invalid').siblings('.invalid-feedback').text('Het veld is verplicht!')
                                }
                            }
                        })
                    }
                },
                catch: function (errors) {
                    console.log(errors);
                }
            })
        })
    });
})(jQuery);