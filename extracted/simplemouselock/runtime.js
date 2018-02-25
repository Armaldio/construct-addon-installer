// ECMAScript 5 strict mode
'use strict';

assert2(cr, 'cr namespace not created');
assert2(cr.plugins_, 'cr.plugins_ not created');

/////////////////////////////////////
//'Global' vars
/////////////////////////////////////
var mouseX_screenLock = 0;			//TIM: mouse position w/ screen lock
var mouseY_screenLock = 0;

var comeFromUnFocus = false;

/////////////////////////////////////

/////////////////////////////////////
// Plugin class
// *** CHANGE THE PLUGIN ID HERE *** - must match the "id" property in edittime.js
//          vvvvvvvv
cr.plugins_.armaldio_mouse_lock = function (runtime) {
    this.runtime = runtime;
};

(function () {
    /////////////////////////////////////
    // *** CHANGE THE PLUGIN ID HERE *** - must match the "id" property in edittime.js
    //                            vvvvvvvv
    var pluginProto = cr.plugins_.armaldio_mouse_lock.prototype;

    /////////////////////////////////////
    // Object type class
    pluginProto.Type = function (plugin) {
        this.plugin  = plugin;
        this.runtime = plugin.runtime;
    };

    var typeProto = pluginProto.Type.prototype;

    // called on startup for each object type
    typeProto.onCreate = function () {
    };

    //Set in InstanceProto.onCreate
    var isInPreview = false;

    //Create alias vars for Mouselock runtime, instance, and div id.
    var MouseLock_Runtime  = null;
    var MouseLock_Instance = null;
    var elem               = null;
    var canvas             = null;

    /////////////////////////////////////
    // Instance class
    pluginProto.Instance = function (type) {
        this.type    = type;
        this.runtime = type.runtime;

        MouseLock_Runtime  = this.runtime;	//This is for document event listeners to refer back to the plugin.
        MouseLock_Instance = this;			//Ditto above. Need both of these.
        elem               = this.runtime.canvasdiv;
        canvas             = jQuery("#c2canvas");

        // any other properties you need, e.g...
        // this.myValue = 0;
    };

    var instanceProto = pluginProto.Instance.prototype;

    // called whenever an instance is created
    instanceProto.onCreate = function () {
        // note the object is sealed after this call; ensure any properties you'll ever need are set on the object
        // e.g...

        //START// Tim mod: runtime properties//

        //Debug:

        this.tickTest = 0;

        //For Internal Logic

        //so that we know if we are in preview mode or not.
        isInPreview = (typeof cr_is_preview !== 'undefined');

        //cache last x/y reading. For computing movement angle, dead zone, smoothing.
        this.last_x = 0;
        this.last_y = 0;

        //cache last raw x/y reading. For custom movement (also, right now, for movement angle).
        this.last_raw_x = 0;
        this.last_raw_y = 0;

        //Used in tick function for generating movement angle.
        this.move_angle_tmp = 0;

        //ACE's:

        //For actions:

        this.mouse_lock_state = 0;	//mouse lock state //DEBUG: What is this for?

        //For conditions:

        this.is_supported = 0;	//is mouse lock supported?
        this.is_locked    = 0;	//is mouse locked?
        this.is_moving    = 0;	//is mouse moving?

        //For expressions:

        this.raw_x          = 0;	//raw y val
        this.raw_y          = 0;	//raw x val
        this.mouse_lock_x   = 0;	//mouse lock x val
        this.mouse_lock_y   = 0;	//mouse lock y val
        this.movement_angle = 0;	//angle of movement

        //END// Tim mod: runtime properties//

        //ALIAS PROPERTIES CLASS
        var props = this.properties;

        //START// Tim mod: Alias properties define in edittime//

        this.activate_on       = props[0];
        this.custom_key_lock   = props[1];
        this.bounding          = props[2];
        this.disable_if_unlock = 0;
        this.smoothing         = 0;
        this.invert_x          = props[4];
        this.invert_y          = props[5];
        this.cursor_speed      = props[6];
        this.dead_zone         = 0;
        this.speed_cap         = 0;
        this.response_curve    = 0;
        this.debug             = false; //props[ 6 ];
        this.outoffocusmode    = props[3];

        //END// Tim mod: Alias properties define in edittime//

        ////////////////////////////////////STARTUP FUNCTIONS////////////////////////////////

        if (this.outoffocusmode) {
            jQuery(window).focus(function () {
                jQuery(document).one('mousedown', function () {
                    self.lockPointer();
                    comeFromUnFocus = false;
                });
            });

            jQuery(window).blur(function () {
                self.is_locked = 0;
            });
        }

        jQuery(window).resize(function () {
            self.unlockPointer();
        });

        jQuery(document).on('webkitfullscreenchange mozfullscreenchange fullscreenchange', function (e) {
            if (self.is_locked === 0) {
                self.unlockPointer();
                self.runtime.canvas.requestPointerLock();
            } else {
                self.unlockPointer();
            }

        });

        //Set is_supported. 0 if false, 1 if true.
        this.is_supported = 'pointerLockElement' in document ||
                            'mozPointerLockElement' in document ||
                            'webkitPointerLockElement' in document;

        //If is_supported is null, log to console:
        if (!this.is_supported) {
            console.log('Warning! Mouse locking is not supported on this platform!');
        }

        var self = this;

        if (this.activate_on == 1) //activate on double click
        {
            //associates single click with function onDoubleClick
            jQuery(document).on('mousedown', function () {
                self.lockPointer();
                comeFromUnFocus = false;
            });
        }

        //Activate on custom key
        if (this.activate_on == 2) //custom key
        {
            if (self.debug) {
                console.log('Custom key if statement has run.');
            }

            //On key up, if said key(e) matches the keycode in custom_key_lock, call lockPointer.
            jQuery(document).keyup(function (e) {
                    if (self.debug) {
                        console.log('jquery key up has run. any key being released should call this.');
                    }
                    if (e.keyCode === self.custom_key_lock) {
                        if (self.debug) {
                            console.log('e.keyCode matches custom_key_lock. Now, lock pointer will be called.');
                        }
                        self.lockPointer();
                    }
                    else {
                        if (self.debug) {
                            console.log('e.keyCode did not match custom_key_lock. Here are the vals:');
                            console.log('e.keyCode:');
                            console.log(e.keyCode);
                            console.log('self.custom_key_lock:');
                            console.log(self.custom_key_lock);
                        }
                    }
                }
            );
        }

        //////////////////////////////////END STARTUP FUNCTIONS//////////////////////////////

        //TIM MOD: Listeners:

        //Listens for mouse to move, calls moveCallback to update vars mouseX/Y_screenLock.

        document.addEventListener('mousemove', this.moveCallback, false);

        //Listens for errors

        document.addEventListener('pointerlockerror', pointerLockError, false);
        document.addEventListener('mozpointerlockerror', pointerLockError, false);
        document.addEventListener('webkitpointerlockerror', pointerLockError, false);

        //Listens for changes (trying to face the strange -- cha-cha-chang-ge's)

        document.addEventListener('pointerlockchange', this.pointerLockChange, false);
        document.addEventListener('mozpointerlockchange', this.pointerLockChange, false);
        document.addEventListener('webkitpointerlockchange', this.pointerLockChange, false);

        //Do Tick.
        this.runtime.tickMe(this);
    };

    //Call this function to lock pointer. Doesn't test any conditions.
    instanceProto.lockPointer = function () {
        //Set Is Locked to true. I think, if this fails, it will go back to 0.
        this.is_locked = 1;

        //this feeds the correct function (browser dependant terminology) into requestPointerLock
        this.runtime.canvas.requestPointerLock = this.runtime.canvas['requestPointerLock'] || this.runtime.canvas['mozRequestPointerLock'] || this.runtime.canvas['webkitRequestPointerLock'];

        //Lock the pointer
        this.runtime.canvas.requestPointerLock();
    };

    //Call this function to unlock pointer. Doesn't test any conditions.
    instanceProto.unlockPointer = function () {
        //Set Is Locked to false. Isn't possible to relock without calling lockPointer, which will reset this.
        this.is_locked = 0;

        //this feeds the correct function (browser dependant terminology) into exitPointerLock
        document.exitPointerLock = document['exitPointerLock'] ||
                                   document['mozExitPointerLock'] ||
                                   document['webkitExitPointerLock'];
        //Unlock the pointer
        document.exitPointerLock();
    };

    instanceProto.moveCallback = function (e) {

        //Set vars
        mouseX_screenLock = e['movementX'] || e['mozMovementX'] || e['webkitMovementX'] || 0;
        mouseY_screenLock = e['movementY'] || e['mozMovementY'] || e['webkitMovementY'] || 0;

        //Track all mouse movements into console
        /*console.log('Mouse Moved ...');
        console.log(mouseX_screenLock);
        console.log(mouseY_screenLock);*/
    };

    instanceProto.MovementLogic = function (raw_xy, invert_xy, x_or_y)
        //raw_x/y, invert status, and whether feeding x or y (for caching last_x/y)
    {
        //Speed cap correct

        var speed_cap_proxy = this.speed_cap; //proxy this.speed_cap

        //equal to or less than 0? Make improbably large (effectively disabled).
        if (speed_cap_proxy <= 0) {
            speed_cap_proxy = 1000000;
        }

        //Cursor speed
        this.temp_xy = raw_xy * this.cursor_speed;

        //deadzone and speed cap
        if (this.temp_xy < 0)	//temp_x is negative number
        {
            this.temp_xy = cr.clamp(this.temp_xy, speed_cap_proxy * -1, this.dead_zone * -1);
        } else				//temp_x is positive number
        {
            this.temp_xy = cr.clamp(this.temp_xy, this.dead_zone, speed_cap_proxy);
        }

        //deadzone correct (if temp_xy < deadzone, should return 0, but clamp returns deadzone instead. So, follow clamp with this)
        if (Math.abs(this.temp_xy) == this.dead_zone) {
            this.temp_xy = 0;
        }

        //If not over deadzone threshold, increment is_moving (for condition 'Is Moving')
        else {
            this.is_moving += 1;
        }

        //If invert is true, invert
        if (invert_xy) {
            this.temp_xy *= -1;
        }

        //for x...
        if (x_or_y == 'x') {
            this.last_x = this.mouse_lock_x;		//cache last mouse x
            this.mouse_lock_x += this.temp_xy;		//add temp_xy to current mouse x
        }
        //for y...
        if (x_or_y == 'y') {
            this.last_y = this.mouse_lock_y;		//see above
            this.mouse_lock_y += this.temp_xy;		//see above
        }
    };

    instanceProto.BoundingLogic = function (xy, x_or_y)
        //val being fed in, and what kind of val (x or y) being fed in.
    {
        //Begin Bounding tests:

        //Bound to Window:
        if (this.bounding === 0) {
            /*xy = cr.clamp(xy, 0, x_or_y === 'x' ? this.runtime.width :
                                 x_or_y === 'y' ? this.runtime.height :
                                 'Null Return');*/
        }

        //Bound to Layout:
        if (this.bounding === 1) {
           /* xy = cr.clamp(xy, 0, x_or_y === 'x' ? this.runtime.running_layout.width :
                                 x_or_y === 'y' ? this.runtime.running_layout.height :
                                 'Null Return');*/
            /*xy = cr.clamp(xy, 0, x_or_y === 'x' ? this.runtime.running_layout.width :
                                 x_or_y === 'y' ? this.runtime.running_layout.height :
                                 'Null Return');*/

        }
        return xy;
    };

    //This runs every tick
    instanceProto.tick = function () {

        //Clear this at the beginning of every tick
        this.is_moving = 0;

        this.last_raw_x = this.raw_x;
        this.last_raw_y = this.raw_y;

        //Raw Values: Update to new vals
        if (this.is_locked) {
            this.raw_x = mouseX_screenLock;
            this.raw_y = mouseY_screenLock;

            //Movement Logic:

            //for x...
            this.MovementLogic(this.raw_x, this.invert_x, 'x'); //send in raw x, invert x, tell movement logic to process as 'x'
            //for y...
            this.MovementLogic(this.raw_y, this.invert_y, 'y'); //send in raw y, invert y, tell movement logic to process as 'y'

            //Bounding: (Always run after 'Movement Logic')
            //for x...
            this.mouse_lock_x = this.BoundingLogic(this.mouse_lock_x, 'x');	//send in mouse_lock_x, tell that sending in x
            //for y...
            this.mouse_lock_y = this.BoundingLogic(this.mouse_lock_y, 'y');	//send in mouse_lock_y, tell that sending in y

            //Movement Angle Calc:

            //Figure current angle from current and last mouse position.
            this.move_angle_tmp = cr.to_degrees(cr.angleTo(this.last_x, this.last_y, this.mouse_lock_x, this.mouse_lock_y));

            //Correct angle if less than 0
            if (this.move_angle_tmp < 0) {
                this.move_angle_tmp += 360;
            }

            //if the mouse position hasn't changed more than the deadzone for either x or y, set move angle to -1.
            if ((Math.abs(this.last_x - this.raw_x) && Math.abs(this.last_y - this.raw_y)) < this.dead_zone) {
                this.movement_angle = -1;
            }
            //otherwise, set it to computed angle
            else {
                this.movement_angle = this.move_angle_tmp;
            }

        }

        //Clear these vals at end of tick.
        mouseX_screenLock = 0;
        mouseY_screenLock = 0;
    };

    //When pointer lock state changes
    instanceProto.pointerLockChange = function () {
        if (document.pointerLockElement === MouseLock_Runtime.canvas) {
            if (self.debug) {
                console.log('Pointer is locked. is_locked is true. Calling trigger OnLock.');
            }
            MouseLock_Instance.is_locked = 1;		//I do this elsewhere; consider this a double check.
            MouseLock_Runtime.trigger(cr.plugins_.armaldio_mouse_lock.prototype.cnds.OnLock, MouseLock_Instance);

        }
        else {
            if (self.debug) {
                console.log('Pointer is unlocked. is_unlocked is true. Calling trigger OnUnlock.');
            }
            MouseLock_Instance.is_locked = 0;		//I do this elsewhere; consider this a double check.
            MouseLock_Runtime.trigger(cr.plugins_.armaldio_mouse_lock.prototype.cnds.OnUnlock, MouseLock_Instance);
        }

    };

    // called whenever an instance is destroyed
    // note the runtime may keep the object after this call for recycling; be sure
    // to release/recycle/reset any references to other objects in this function.
    instanceProto.onDestroy = function () {
    };

    // The comments around these functions ensure they are removed when exporting, since the
    // debugger code is no longer relevant after publishing.
    /**BEGIN-PREVIEWONLY**/
    instanceProto.getDebuggerValues = function (propsections) {
        // Append to propsections any debugger sections you want to appear.
        // Each section is an object with two members: "title" and "properties".
        // "properties" is an array of individual debugger properties to display
        // with their name and value, and some other optional settings.
        propsections.push({
            'title'     : 'Status',
            'properties': [
                // Each property entry can use the following values:
                // "name" (required): name of the property (must be unique within this section)
                // "value" (required): a boolean, number or string for the value
                // "html" (optional, default false): set to true to interpret the name and value
                //									 as HTML strings rather than simple plain text
                // "readonly" (optional, default false): set to true to disable editing the property

                // Example:
                // {"name": "My property", "value": this.myValue}

                {
                    'name'    : 'Is Supported?',
                    'value'   : this.is_supported ? 'True' : 'False',
                    'readonly': true
                },
                {
                    'name'    : 'Is Locked?',
                    'value'   : this.is_locked ? 'True' : 'False',
                    'readonly': true
                },
                {
                    'name'    : 'Is Moving?',
                    'value'   : this.is_moving ? 'True' : 'False',
                    'readonly': true
                }
            ]
        });

        propsections.push({
            'title'     : 'Settings',
            'properties': [
                {
                    'name'    : 'Activate On',
                    'value'   : this.activate_on,
                    'readonly': true
                },
                {
                    'name'    : 'Disable if Unlocked',
                    'value'   : this.disable_if_unlock ? 'True' : 'False',
                    'readonly': false
                },
                {
                    'name'    : 'Invert X',
                    'value'   : this.invert_x ? 'True' : 'False',
                    'readonly': false
                },
                {
                    'name'    : 'Invert Y',
                    'value'   : this.invert_y ? 'True' : 'False',
                    'readonly': false
                },
                {
                    'name'    : 'Cursor Speed',
                    'value'   : this.cursor_speed,
                    'readonly': false
                },
                {
                    'name'    : 'Deadzone',
                    'value'   : this.dead_zone,
                    'readonly': false
                },
                {
                    'name'    : 'Speed Cap',
                    'value'   : this.speed_cap,
                    'readonly': false
                },
                {
                    'name'    : 'Tick Test',
                    'value'   : this.tickTest,
                    'readonly': false
                },
                {
                    'name'    : 'Custom Key Readout',
                    'value'   : this.custom_key_lock,
                    'readonly': false
                }
            ]
        });

        propsections.push({
            'title'     : 'Movement Data',
            'properties': [
                {
                    'name'    : 'Movement Angle',
                    'value'   : this.movement_angle,
                    'readonly': true
                },
                {
                    'name'    : 'Raw X',
                    'value'   : this.raw_x,
                    'readonly': true
                },
                {
                    'name'    : 'Raw Y',
                    'value'   : this.raw_y,
                    'readonly': true
                },
                {
                    'name'    : 'Mouse Lock X',
                    'value'   : this.mouse_lock_x,
                    'readonly': true
                },
                {
                    'name'    : 'Mouse Lock Y',
                    'value'   : this.mouse_lock_y,
                    'readonly': true
                }
            ]
        });
    };

    instanceProto.onDebugValueEdited = function (header, name, value) {
        // Called when a non-readonly property has been edited in the debugger. Usually you only
        // will need 'name' (the property name) and 'value', but you can also use 'header' (the
        // header title for the section) to distinguish properties with the same name.

        if (name === 'Disable if Unlocked') {
            this.disable_if_unlock = value;
        }

        if (name === 'Invert X') {
            this.invert_x = value;
        }

        if (name === 'Invert Y') {
            this.invert_y = value;
        }

        if (name === 'Cursor Speed') {
            this.cursor_speed = value;
        }

        if (name === 'Deadzone') {
            this.dead_zone = value;
        }

        if (name === 'Speed Cap') {
            this.speed_cap = value;
        }
    };

    /**END-PREVIEWONLY**/

    //////////////////////////////////////
    // Conditions
    function Cnds () {
    };

    //Normal Conditions:

    // Is pointer lock supported?
    Cnds.prototype.IsSupported = function () {
        return this.is_supported;
    };

    // Is pointer currently locked?
    Cnds.prototype.IsLocked = function () {
        return this.is_locked;
    };

    // Is mouse moving?
    Cnds.prototype.IsMoving = function () {
        return this.is_moving;
    };

    //Trigger Conditions:

    // This is triggered when pointer is locked.
    Cnds.prototype.OnLock = function () {
        return true;
    };

    // This is triggered when pointer is unlocked.
    Cnds.prototype.OnUnlock = function () {
        return true;
    };
    // ... other conditions here ...

    pluginProto.cnds = new Cnds();

    //////////////////////////////////////
    // Actions
    function Acts () {
    };

    Acts.prototype.SetMouseLock = function (setMouseLock) {
        var self = this;

        // set mouse lock
        this.mouse_lock_state = setMouseLock;

        if (this.mouse_lock_state == 0)	//action is calling for lock to be enabled
        {
            // alert the message
            if (self.debug) {
                console.log('Trying to enable mouse lock');
            }
            //lock pointer
            this.lockPointer();
        }
        else							//action calling for lock to be disabled
        {
            // print to console
            if (self.debug) {
                console.log('Trying to disable mouse lock (or, this test could be failing)');
            }
            //Unlock pointer
            this.unlockPointer();
        }
    };

    Acts.prototype.SetLockedCursorXPosition = function (NewLockedX) {
        this.mouse_lock_x = NewLockedX;
    };

    Acts.prototype.SetLockedCursorYPosition = function (NewLockedY) {
        this.mouse_lock_y = NewLockedY;
    };

    Acts.prototype.InvertX = function (NewInvertX) {
        // invert x axis
        this.invert_x = NewInvertX;
    };

    Acts.prototype.InvertY = function (NewInvertY) {
        // invert y axis
        this.invert_y = NewInvertY;
    };

    Acts.prototype.SetCursorSpeed = function (NewCursorSpeed) {
        //set cursor_speed to new value
        this.cursor_speed = NewCursorSpeed;
    };

    Acts.prototype.SetSpeedCap = function (NewSpeedCap) {
        //set speed_cap to new value
        this.speed_cap = NewSpeedCap;
    };

    Acts.prototype.SetDeadZone = function (NewDeadZone) {
        //set dead_zone to new value
        this.dead_zone = NewDeadZone;
    };

    Acts.prototype.SetResponseCurve = function (NewResponseCurve) {
        //set dead_zone to new value
        this.response_curve = NewResponseCurve;
    };

    Acts.prototype.SetCustomLockActivateKey = function (NewCustomKey) {
        //set custome key lock to new value
        if (this.custom_key_lock === 27)	//If keycode is ESC(keycode 27)...
        {
            //warn developer...
            console.log('Warning: you tried to set custom lock key to ESC. Defaulting back to Enter/Return(keycode 13). ESC is hardwired to unlock the pointer. When you set it to lock the pointer on keyup, it always relocks when you let up on ESC. This, obviously, creates a very nasty situation where the user loses control over his browser; thus, this override.');
            //and if he is in debug, warn him even better:
            if (isInPreview) {
                alert('Warning: you tried to set custom lock key to ESC. Defaulting back to Enter/Return(keycode 13). ESC is hardwired to unlock the pointer. When you set it to lock the pointer on keyup, it always relocks when you let up on ESC. This, obviously, creates a very nasty situation where the user loses control over his browser; thus, this override.');
            }
            //and, finally, correct keycode to enter(13):
            this.custom_key_lock = 13;
        }
        else	//Otherwise, set value as usual
        {
            this.custom_key_lock = NewCustomKey;
        }
    };

    // ... other actions here ...

    ///////////////////////////////////////////////////////////////
    //Stand Alone Functions:
    ///////////////////////////////////////////////////////////////

    //If there is an error locking pointer, log to console.
    function pointerLockError () {
        //If there is a pointer lock error, assume that it is an error to lock, not unlock (unable to unlock very unlikely.)
        //MouseLock_Instance is used since this isn't a sub-function of InstanceProto or TypeProto.
        MouseLock_Instance.is_locked = 0;

        //Debug log
        console.log('Error while locking pointer.');
    }

    ///////////////////////////////////////////////////////////////
    //END: Stand Alone Functions
    ///////////////////////////////////////////////////////////////

    pluginProto.acts = new Acts();

    //////////////////////////////////////
    // Expressions
    function Exps () {
    };

    //Raw X val
    Exps.prototype.RawX = function (ret) {
        //disable on unlock is true and not locked? Return 0 (this is the movement val. So, no movement).
        if (this.disable_if_unlock && !this.is_locked) {
            ret.set_float(0);
        }
        //otherwise, return normal val
        else {
            ret.set_float(this.raw_x);
        }
    };

    //Raw Y val
    Exps.prototype.RawY = function (ret) {
        //disable on unlock is true and not locked? Return 0 (this is the movement val. So, no movement).
        if (this.disable_if_unlock && !this.is_locked) {
            ret.set_float(0);
        }
        //otherwise, return normal val
        else {
            ret.set_float(this.raw_y);
        }
    };

    //New MouseLock X/Y Functions (just return values) (Okay, so do a little more than just return values...)

    Exps.prototype.MouseLockX = function (ret, layerparam) {
        //disable on unlock is true? Return 0 (x and y both 0, so pointer goes to upper left hand corner of window/layout)
        if (this.disable_if_unlock && !this.is_locked) {
            ret.set_float(0);
        }

        //otherwise, do normal logic
        else {
            if (cr.is_undefined(layerparam)) {
                if (this.bounding === 0) { // window
                    //ret.set_float(layer.canvasToLayer(this.mouse_lock_x, this.mouse_lock_y, true)); //true for x, false for y
                    if (this.mouse_lock_x < 0)
                        this.mouse_lock_x = 0;
                    if (this.mouse_lock_x >= this.runtime.original_width)
                        this.mouse_lock_x = this.runtime.original_width;
                    if (this.mouse_lock_y < 0)
                        this.mouse_lock_y = 0;
                    if (this.mouse_lock_y >= this.runtime.original_height)
                        this.mouse_lock_y = this.runtime.original_height;

                    ret.set_float(this.mouse_lock_x);

                } else if (this.bounding === 1) {
                    if (this.mouse_lock_x < 0)
                        this.mouse_lock_x = 0;
                    if (this.mouse_lock_x >= this.runtime.running_layout.width)
                        this.mouse_lock_x = this.runtime.running_layout.width;
                    if (this.mouse_lock_y < 0)
                        this.mouse_lock_y = 0;
                    if (this.mouse_lock_y >= this.runtime.running_layout.height)
                        this.mouse_lock_y = this.runtime.running_layout.height;

                    ret.set_float(this.mouse_lock_x);
                } else {
                    ret.set_float(this.mouse_lock_x);
                }
            }
        }
    };

    Exps.prototype.MouseLockY = function (ret, layerparam) {
        //disable on unlock is true? Return 0 (x and y both 0, so pointer goes to upper left hand corner of window/layout).
        if (this.disable_if_unlock && !this.is_locked) {
            ret.set_float(0);
        }
        else {
            if (cr.is_undefined(layerparam)) {
                console.log(this.runtime.original_width, this.mouse_lock_x);

                if (this.bounding === 0) { // window
                    if (this.mouse_lock_x < 0)
                        this.mouse_lock_x = 0;
                    if (this.mouse_lock_x >= this.runtime.original_width)
                        this.mouse_lock_x = this.runtime.original_width;
                    if (this.mouse_lock_y < 0)
                        this.mouse_lock_y = 0;
                    if (this.mouse_lock_y >= this.runtime.original_height)
                        this.mouse_lock_y = this.runtime.original_height;

                    ret.set_float(this.mouse_lock_y);

                } else if (this.bounding === 1) {
                    if (this.mouse_lock_x < 0)
                        this.mouse_lock_x = 0;
                    if (this.mouse_lock_x >= this.runtime.running_layout.width)
                        this.mouse_lock_x = this.runtime.running_layout.width;
                    if (this.mouse_lock_y < 0)
                        this.mouse_lock_y = 0;
                    if (this.mouse_lock_y >= this.runtime.running_layout.height)
                        this.mouse_lock_y = this.runtime.running_layout.height;

                    ret.set_float(this.mouse_lock_y);
                } else {
                    ret.set_float(this.mouse_lock_y);
                }
            }
        }
    };

    //Current movement angle
    Exps.prototype.MovementAngle = function (ret) {
        //return angle
        ret.set_float(this.movement_angle);
    };
    ///////////////////END TIM MOD///////////////////

    pluginProto.exps = new Exps();

}());