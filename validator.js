function Validator(formSelector,) {
    var formRules = {};
    var _this = this;
    function getParent(element, selector) {
        while(element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }



    
    // Quy ước tạo rule: 
    // -Nếu có lỗi thì return `error mesage`
    // -Nếu không thì return `undefinfed`
    var validatorRules = {
        required: function (value) {
            return value ? undefined : 'Vui lòng nhập trường này';
        },
        email: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : 'Vui lòng nhập email';
        },
        min: function (min) {
            return function (value) {
                return value.length >= min ? undefined : `Vui long nhap it nhat ${min} kí tự`;
            }
        },
        max: function (min) {
            return function (value) {
                return value.length <= max ? undefined : `Vui long nhap it nhat ${min} kí tự`;
            }
        },
    }
    // Lấy ra form element trong DOM theo 'formSelector'
    var formElement = document.querySelector(formSelector);
    
    // Chỉ xử lí khi lấy dc element trong DOM
    if (formElement) {
        var inputs = formElement.querySelectorAll('[name][rules]');
        
        for (var input of inputs) {
            var rules = input.getAttribute('rules').split('|');
            for (var rule of rules) {
                var ruleInfo;
                var isRuleHasValue = rule.includes(':');

                if(isRuleHasValue) {
                    ruleInfo = rule.split(':');
                    rule = ruleInfo[0];
                }

                var ruleFuc = validatorRules[rule];

                if (isRuleHasValue) {
                    ruleFuc = ruleFuc(ruleInfo[1]);
                }

                // console.log(rule);
                if (Array.isArray(formRules[input.name])) {
                    formRules[input.name].push(ruleFuc);
                } else {
                    formRules[input.name] = [ruleFuc]
                }
            }
            // Lắng nghe sự kiện để validate (blur, change, ...)
            input.onblur = handleValidate;
            input.oninput = handleClearError;
        }


            // Hàn thực hiện validate
            function handleValidate(event) {
                var rules = formRules[event.target.name];
                var errorMessage;
                for (var rule of rules) {
                    errorMessage =  rule(event.target.value);
                    if(errorMessage) break;
                }
                // Nếu có lỗi thì hiển thị ra UI
                if (errorMessage) {
                    var formNhap = getParent(event.target, '.form-nhap');

                    if (formNhap) {
                        formNhap.classList.add('invalid');
                        var formMsg = formNhap.querySelector('.form-msg');
                        if (formMsg) {
                            formMsg.innerText = errorMessage;
                        }
                    }
                }
                return !errorMessage;
            }
            // Hàm xóa lỗi
            function handleClearError(event) {
                var formNhap = getParent(event.target, '.form-nhap');
                if(formNhap.classList.contains('invalid')) {
                    formNhap.classList.remove('invalid');
                    var formMessage = formNhap.querySelector('.form-msg');
                    if(formMessage) {
                        formMessage.innerText = '';
                    }
                }
            }
    }
    // Xử lí hành vi submit form
    formElement.onsubmit = function(event) {
        event.preventDefault();
        var inputs = formElement.querySelectorAll('[name][rules]');
        var isValid = true;
        for (var input of inputs) {
            if (!handleValidate({target : input})) {
                isValid = false;
            }
        }

        // Khi không có lỗi thì submit form
        if (isValid) {
                if(typeof _this.onSubmit === 'function') {
                    var enableInputs = formElement.querySelectorAll('[name]');

                    var formValues = Array.from(enableInputs).reduce(function (values, input) {
                        switch(input.type) {
                            case 'checkbox':
                            case 'radio':
                                values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value;
                                break;
                            default:
                                values[input.name] = input.value;
                        }
                        return values;
                    }, {});
                    _this.onSubmit(formValues);
                } else {
                    formElement.submit();
                }
        }
    }
}