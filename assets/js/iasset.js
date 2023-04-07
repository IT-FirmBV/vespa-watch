(function($) {
    $(document).ready(function () {
        let map, infoWindow, incr = 0, marker, fileIds = [], checkAndRadioIds = [], apiUrl = 'https://apiv2.iasset.nl/', apiToken = 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiJjMjBiNWY2ZS1iNTRhLTExZWEtOWYzZS0wMjQyYWMxYjAwMDIiLCJqdGkiOiJkM2JlYmU0ZmZjZjA2YWVjMTdkZjVlN2VhZjg4N2EyZWE4ZDNjZjU4MmVkNDEwYzhiZjk4ZmM2YmEyNjlkZDhmODJjYzhmMjZmZTU1OWVhMCIsImlhdCI6MTY3OTkxNjQ1MCwibmJmIjoxNjc5OTE2NDUwLCJleHAiOjE3MTE1NDI0NTAsInN1YiI6IjUyNDciLCJzY29wZXMiOltdfQ.gCIv6Qv1NBFVyptL53ZP7UJld9YAQHR6dhjnrC_cyR9o51sLefOoNOtUE5tJbkt8kk1zcmfug3Y6sUM3io8TazjQZdRtI0X9OI2u8kEDeRJeD1q26HNCll9-lx4i3cd6_9ch__rFT4wzJquG_GEn8-SUus_RJQ7shkK2ETv5XLY-oFYz5tMcdqTFcb4rkSTH9-i8TOlfw28genjfORy9GLDOfBIUXm2W0P2u-dmBFVBY19-MzGUgCHo_aUIxK2PJ2eBkQzHTPTr8qoAv4IF920a5hK7abe2EzfH7Y6tZEu6P7HESUc5Fn2cZryNAgItVV0BgrbyyZwEuqzKD2CEqdkSNtaTsiimPkNWUlq87TM2eqStTAoBrtjtdtQfd3Iv1EBgmVQiiW2XEsbaooOg_b1lv8R1awKncpyBSUIQNgV789LrezuwCiDzpYEC3DB7E3eZ_s72n7ALez768tMi79GJMGfz-8UQiw-vsrmONh8PZtZ62MfQzYwmn9Y6fNiKj354K6Z9OgkbQ8ThX7S53vCBlQMJSCv8EgZB3hD7SXq8a8HkWHxmjviUtNO7aeJojLSqgvr5i2I_YVGRPDP5xuOkRBfaVBvxilzdtjQ6WmSVF20-E18XjdEG-ENMBtuIree4gpyYpfLEQgWzbsylgPnKv_ARJdOA-kDbGSp8vMX0';

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
                let label = ['checkbox', 'radio', 'current_user', 'field_group'].includes(el.field_type) ? '' : '<label class="form-label" ' +
                    'for="' + selector + '">' + el.label + (Boolean(parseInt(el.mandatory)) ? ' *' : '') + '</label>';
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

                        input = '<input class="form-control" type="' + type + '" ' +
                            'id="' + selector + '" name="' + selector + '" data-id="' + el.id + '"' +
                            (Boolean(parseInt(el.mandatory)) ? "required " : "") + ((Boolean(parseInt(el.hidden)) || el.info === 'hidden') ? "hidden " : "") +
                            (Boolean(parseInt(el.readonly)) ? "readonly" : "") + '>' +
                            '<div id="' + el.id + '" class="invalid-feedback"></div>';
                        break;
                    case 'location':
                        input = '<input class="form-control" type="text" ' +
                            'id="' + selector + '" name="' + selector + '" data-id="' + el.id + '" data-location="' + true + '"' +
                            (Boolean(parseInt(el.mandatory)) ? "required " : "") + ((Boolean(parseInt(el.hidden)) || el.info === 'hidden') ? "hidden " : "") +
                            (Boolean(parseInt(el.readonly)) ? "readonly" : "") + ' readonly>' +
                            '<div id="' + el.id + '" class="invalid-feedback"></div>' +
                            '<div class="loader text-center mt-2 d-none"><div class="spinner-border" role="status"></div></div>' +
                            '<div class="close-button text-end my-2 d-none"><button class="btn btn-danger" type="button">X</button></div>' +

                            '<div id="googleMap" style="width:100%;height:400px;" class="d-none"></div>';
                        break;
                    case 'datetime':
                        input = '<input class="form-control" type="datetime-local" ' +
                            'id="' + selector + '" name="' + selector + '" data-id="' + el.id + '"' +
                            (Boolean(parseInt(el.mandatory)) ? "required " : "") + ' ' + ((Boolean(parseInt(el.hidden)) || el.info === 'hidden') ? "hidden " : "") +
                            (Boolean(parseInt(el.readonly)) ? "readonly " : "") + (Boolean(parseInt(el.autofill)) ?
                                'value="' + new Date().toISOString().split('T')[0] + 'T' + new Date().toLocaleTimeString() + '" ': "") + '>' +
                            '<div id="' + el.id + '" class="invalid-feedback"></div>';
                        break;
                    case 'date':
                        input = '<input class="form-control" type="date" ' +
                            'id="' + selector + '" name="' + selector + '" data-id="' + el.id + '"' +
                            (Boolean(parseInt(el.mandatory)) ? "required " : "") + ' ' + ((Boolean(parseInt(el.hidden)) || el.info === 'hidden') ? " " : "") +
                            (Boolean(parseInt(el.readonly)) ? "readonly" : "") + (Boolean(parseInt(el.autofill)) ?
                                'value="' + new Date().toISOString().split('T')[0] + '" ': "") + '>' +
                            '<div id="' + el.id + '" class="invalid-feedback"></div>';
                        break;
                    case 'photo':
                        fileIds.push(el.id);

                        input = '<input class="form-control" type="file" ' +
                            'id="' + selector + '" name="' + selector + '" accept=".jpg,.jpeg,.png,.gif" data-image="true" data-id="' + el.id + '"' +
                            (Boolean(parseInt(el.mandatory)) ? "required " : "") + ((Boolean(parseInt(el.hidden)) || el.info === 'hidden') ? " hidden " : "") +
                            (Boolean(parseInt(el.readonly)) ? "readonly" : "") + '>' +
                            '<div id="' + el.id + '" class="invalid-feedback"></div>';
                        break;
                    case 'textarea':
                        input = '<textarea class="form-control" ' +
                            'id="' + selector + '" name="' + selector + '" data-id="' + el.id + '"' +
                            (Boolean(parseInt(el.mandatory)) ? "required " : "") + ((Boolean(parseInt(el.hidden)) || el.info === 'hidden') ? " hidden " : "") +
                            (Boolean(parseInt(el.readonly)) ? "readonly" : "") + '></textarea>' +
                            '<div id="' + el.id + '" class="invalid-feedback"></div>';
                        break;
                    case 'select':
                        let options = '';

                        el.options.forEach(function (option) {
                            options += '<option value="' + option.option_value + '">' + (option.option_text !== '' ? option.option_text : 'Selecteer...') + '</option>'
                        })

                        input = '<select class="form-control" ' +
                            'id="' + selector + '" name="' + selector + '" data-id="' + el.id + '"' +
                            (Boolean(parseInt(el.mandatory)) ? "required " : "") + ((Boolean(parseInt(el.hidden)) || el.info === 'hidden') ? "hidden " : "") +
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
                        checkAndRadioIds.push(el.id);

                        input = '<label><span class="d-block">'  + el.label + (Boolean(parseInt(el.mandatory)) ? ' *' : '') + '</span><input class="form-check-input ms-0 me-2" type="checkbox" ' +
                            'id="' + selector + '" name="' + selector + '" data-id="' + el.id + '"' +
                            (Boolean(parseInt(el.mandatory)) ? "required " : "") + ((Boolean(parseInt(el.hidden)) || el.info === 'hidden') ? "hidden " : "") +
                            (Boolean(parseInt(el.readonly)) ? "readonly" : "") + ' value="1">' +
                            '<label class="form-check-label" for="' + selector + '">' + el.info +
                            '</label><div id="' + el.id + '" class="invalid-feedback"></div></label>';
                        break;
                    case 'radio':
                        checkAndRadioIds.push(el.id);

                        input = '<label><span class="d-block">'  + el.label + (Boolean(parseInt(el.mandatory)) ? ' *' : '') + '</span><input class="form-check-input ms-0 me-2" type="radio" ' +
                            'id="' + selector + '" name="' + selector + '" data-id="' + el.id + '"' +
                            (Boolean(parseInt(el.mandatory)) ? "required " : "") + ((Boolean(parseInt(el.hidden)) || el.info === 'hidden') ? "hidden " : "") +
                            (Boolean(parseInt(el.readonly)) ? "readonly" : "") + ' value="1">' +
                            '<label class="form-check-label" for="' + selector + '">' + el.info +
                            '</label><div id="' + el.id + '" class="invalid-feedback"></div></label>';
                        break;
                    case 'current_user':
                        input = '<input class="form-control" type="text" data-user="true"' +
                            'id="' + selector + '" name="' + selector + '" data-id="' + el.id + '"' +
                            (Boolean(parseInt(el.mandatory)) ? "required " : "") + ' hidden value="vespawatch.be"' +
                            (Boolean(parseInt(el.readonly)) ? "readonly" : "") + '>' +
                            '<div id="' + el.id + '" class="invalid-feedback"></div>';
                        break;
                }

                if (el.field_type !== 'field_group') {
                    $('#nest-report-form').append('<div class="' + (el.field_type === 'current_user' || (el.hidden || el.info === 'hidden') ? 'd-none' : 'mb-3') + '">' +
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

        $('#nest-report-form').on('submit', function (e) {
            e.preventDefault()

            let lastIndex = 0;
            let serialisedData = $('#nest-report-form').serializeArray();
            let formData = new FormData();

            $('input').removeClass('is-invalid');
            $('.invalid-feedback').text('');

            serialisedData.forEach((field, index) => {
                formData.append('data[' + index + '][field_id]', parseInt($('#' + field.name).attr('data-id')));
                formData.append('data[' + index + '][value]', field.value);
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

                        formData.append('data[' + lastIndex + '][field_id]', fieldId);
                        formData.append('data[' + lastIndex + '][value]', f[0].files[0] ?? '');
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

                        formData.append('data[' + lastIndex + '][field_id]', boxId);
                        formData.append('data[' + lastIndex + '][value]', f.is(':checked') === true ? 1 : '');
                        formData.append('data[' + lastIndex + '][index]', '0');
                    }
                });
            }

            formData.append('general_inspection', '6') // Hardcoded
            formData.append('general_inspection_record', '20') // Hardcoded
            formData.append('inspection_id', '7') // Hardcoded as this is the inspection ID in iAsset
            formData.append('object_id', 'f9ae8363dda22cec04912d499119699d') // Hardcoded as this is the inspection ID in iAsset

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

                        if (value[0].includes('Invalid email')) {
                            $('#' + serialisedData[keyStr.split('.value')[0]]['name']).addClass('is-invalid').siblings('.invalid-feedback').text('Uw e-mailadres is ongeldig.')
                        } else if (value[0].includes('Invalid phone')) {
                            $('#' + serialisedData[keyStr.split('.value')[0]]['name']).addClass('is-invalid').siblings('.invalid-feedback').text('Uw telefoonnummer is ongeldig.')
                        } else {
                            $('#' + serialisedData[keyStr.split('.value')[0]]['name']).addClass('is-invalid').siblings('.invalid-feedback').text('Dit veld is verplicht.')
                        }
                    }
                }
            })
        })
    });
})(jQuery);