function GetPluginSettings () {
    return {
        'name': 'Simple Mouselock',
        'id': 'armaldio_mouse_lock',
        'version': '1.5',
        'description': 'Allows native-like pointer locking for your projects and games.',
        'author': 'Armaldio',
        'help url': 'https://www.scirra.com/forum/new-simple-native-like-mouselocking-plugin_t199484',
        'category': 'Input',
        'type': 'object',
        'rotatable': false,
        'flags': pf_singleglobal
    };
}

////////////////////////////////////////
// Parameter types:
// AddNumberParam(label, description [, initial_string = "0"])			// a number
// AddStringParam(label, description [, initial_string = "\"\""])		// a string
// AddAnyTypeParam(label, description [, initial_string = "0"])			// accepts either a number or string
// AddCmpParam(label, description)										// combo with equal, not equal, less, etc.
// AddComboParamOption(text)											// (repeat before "AddComboParam" to add combo items)
// AddComboParam(label, description [, initial_selection = 0])			// a dropdown list parameter
// AddObjectParam(label, description)									// a button to click and pick an object type
// AddLayerParam(label, description)									// accepts either a layer number or name (string)
// AddLayoutParam(label, description)									// a dropdown list with all project layouts
// AddKeybParam(label, description)										// a button to click and press a key (returns a VK)

////////////////////////////////////////
// Conditions

// AddCondition(id,					// any positive integer to uniquely identify this condition
//				flags,				// (see docs) cf_none, cf_trigger, cf_fake_trigger, cf_static, cf_not_invertible,
//									// cf_deprecated, cf_incompatible_with_triggers, cf_looping
//				list_name,			// appears in event wizard list
//				category,			// category in event wizard list
//				display_str,		// as appears in event sheet - use {0}, {1} for parameters and also <b></b>, <i></i>
//				description,		// appears in event wizard dialog when selected
//				script_name);		// corresponding runtime function name

// example				
//AddNumberParam("Number", "Enter a number to test if positive.");
//AddComboParamOption("True");
//AddComboParamOption("False");
//AddComboParam("Enable", "Enable/Disable Mouse Lock." ["True", "False", initial_selection = 1]);

//Status Conditions:
AddCondition(0, cf_none, 'Is supported', 'Status Conditions', 'Mouse Lock is supported',
    'True if mouse locking is supported.',
    'IsSupported');

AddCondition(1, cf_none, 'Is locked', 'Status Conditions', 'Mouse is currently locked',
    'True if mouse is locked.',
    'IsLocked');

AddCondition(2, cf_none, 'Is moving', 'Status Conditions', 'Mouse is moving',
    'True if mouse is moving.',
    'IsMoving');

//Trigger Conditions:
AddCondition(3, cf_trigger, 'On Lock', 'Trigger Conditions', 'On Mouse Lock',
    'Triggered when mouse is locked.',
    'OnLock');

AddCondition(4, cf_trigger, 'On Unlock', 'Trigger Conditions', 'On Mouse Unlock',
    'Triggered when mouse is unlocked.',
    'OnUnlock');

////////////////////////////////////////
// Actions

// AddAction(id,				// any positive integer to uniquely identify this action
//			 flags,				// (see docs) af_none, af_deprecated
//			 list_name,			// appears in event wizard list
//			 category,			// category in event wizard list
//			 display_str,		// as appears in event sheet - use {0}, {1} for parameters and also <b></b>, <i></i>
//			 description,		// appears in event wizard dialog when selected
//			 script_name);		// corresponding runtime function name

//Action: Set Mouse Lock (Enabled, Disabled)
AddComboParamOption('Enable');
AddComboParamOption('Disable');
AddComboParam('Set Mouse Lock:', 'Enable/Disable Mouse Lock.', [ 'Enabled', 'Disabled', initial_selection = 1 ]);

AddAction(1, af_none, 'Set Mouse Lock', 'On/Off', '{0} Mouse Lock',
    'Manually enable/disable the mouse lock.', 'SetMouseLock');

//Action: Invert X Axis (True, False)
AddComboParamOption('False');
AddComboParamOption('True');
AddComboParam('Invert X Axis:', 'Invert X Axis.', [ 'False', 'True', initial_selection = 0 ]);

AddAction(3, af_none, 'Invert X Axis', 'Invert', 'Invert X Axis is {0}',
    'Set property Invert X Axis.',
    'InvertX');

//Action: Invert Y Axis (True, False)
AddComboParamOption('False');
AddComboParamOption('True');
AddComboParam('Invert Y Axis:', 'Invert Y Axis.', [ 'False', 'True', initial_selection = 0 ]);

AddAction(4, af_none, 'Invert Y Axis', 'Invert', 'Invert Y Axis is {0}',
    'Set property Invert Y Axis.',
    'InvertY');

//Action: Set Cursor Speed
AddNumberParam('Cursor Speed', 'Set the cursor speed.');

AddAction(5, af_none, 'Set Cursor Speed', 'Advanced', 'Set Cursor Speed to {0}',
    'Set property Cursor Speed.',
    'SetCursorSpeed');

//Action: Set Custom Lock Activate Key (For 'Activate On')
AddKeybParam('Custom Lock Activate Key',
    'Choose a custom key to activate mouse lock.\n\'Activate On\' must be set to \'Custom Key\' for this to work.');

AddAction(9, af_none, 'Mouse Lock on Custom Key', 'Advanced', 'Set Custom Lock Activate Key to <b>{0}</b>.',
    'Choose a custom key to activate mouse lock.\n\'Activate On\' must be set to \'Custom Key\' for this to work.',
    'SetCustomLockActivateKey');

//Action: Set Cursor Speed
AddNumberParam('X Position', 'X Position');
AddAction(10, af_none, 'Set Locked Cursor X Position', 'Advanced', 'Set Locked Cursor X Position to {0}',
	'Set property Locked Cursor X Position.',
	'SetLockedCursorXPosition');

AddNumberParam('Y Position', 'Y Position');
AddAction(11, af_none, 'Set Locked Cursor Y Position', 'Advanced', 'Set Locked Cursor Y Position to {0}',
	'Set property Locked Cursor Y Position.',
	'SetLockedCursorYPosition');

////////////////////////////////////////
// Expressions

// AddExpression(id,			// any positive integer to uniquely identify this expression
//				 flags,			// (see docs) ef_none, ef_deprecated, ef_return_number, ef_return_string,
//								// ef_return_any, ef_variadic_parameters (one return flag must be specified)
//				 list_name,		// currently ignored, but set as if appeared in event wizard
//				 category,		// category in expressions panel
//				 exp_name,		// the expression name after the dot, e.g. "foo" for "myobject.foo" - also the runtime function name
//				 description);	// description in expressions panel

AddExpression(1, ef_return_number, 'Raw X', 'Raw Input', 'RawX',
    '(X axis) Raw mouse position change from last tick.');

AddExpression(2, ef_return_number, 'Raw Y', 'Raw Input', 'RawY',
    '(Y axis) Raw mouse position change from last tick.');

AddExpression(3, ef_return_number | ef_variadic_parameters, 'Mouse Lock X', 'Default Input', 'MouseLockX',
    '(X axis) Mouse position on current layer or layout.');

AddExpression(4, ef_return_number | ef_variadic_parameters, 'Mouse Lock Y', 'Default Input', 'MouseLockY',
    '(Y axis) Mouse position on current layer or layout.');

AddExpression(5, ef_return_number, 'Movement Angle', 'Default Input', 'MovementAngle',
    'Cursor\'s angle of movement. Computed from last two or three positions. If no movement, returns -1.');

////////////////////////////////////////
ACESDone();

////////////////////////////////////////
// Array of property grid properties for this plugin
// new cr.Property(ept_integer,		name,	initial_value,	description)		// an integer value
// new cr.Property(ept_float,		name,	initial_value,	description)		// a float value
// new cr.Property(ept_text,		name,	initial_value,	description)		// a string
// new cr.Property(ept_combo,		name,	"Item 1",		description, "Item 1|Item 2|Item 3")	// a dropdown list (initial_value is string of initially selected item)
// new cr.Property(ept_link,		name,	link_text,		description, "firstonly")		// has no associated value; simply calls "OnPropertyChanged" on click

var property_list = [
    new cr.Property(ept_combo, 'Activate On', 'None',
        'Setting this to \'None\' will only let you enable locking using the actions. \'Any click\' will enable locking as soon as you click on the canvas. \'Custom key\' allows you to define a key below or use the action to define a custom key.',
        'None|Any click|Custom key'),

    new cr.Property(ept_integer, 'Custom Key', 32,
        'If Activate On \'Custom key\' is selected, you can define a key based on the JS keycode system here (keycode list: https://goo.gl/A2D8Rd). WARNING: Setting a custom key using the action will override this!'),

    new cr.Property(ept_combo, 'Bounding', 'Bound to Window',
        'Options to bound to the window or the current layout. Unbounded is for infinite mouse movement not limited by the edge of the screen.',
        'Bound to Window|Bound to Layout|Unbounded'),

    new cr.Property(ept_combo, 'Auto-enable on out of focus', 'True',
        'If enabled, will auto-enable mouselock when the game is back in focus again (e.g. switched tabs, minimized).',
        'False|True'),
	
	new cr.Property(ept_combo, 'Invert X', 'False',
        'Invert X axis movement.',
        'False|True'),

    new cr.Property(ept_combo, 'Invert Y', 'False',
        'Invert Y axis movement.',
        'False|True'),

    new cr.Property(ept_float, 'Cursor Speed', 1,
        'How fast cursor moves in relation to normal cursor speed. 2 would be twice as fast, 0.5 half as fast and so on.')
    
    /*    new cr.Property(ept_combo, 'Log', 'False',
            'Log each output',
            'False|True')*/
];

// Called by IDE when a new object type is to be created
function CreateIDEObjectType () {
    return new IDEObjectType();
}

// Class representing an object type in the IDE
function IDEObjectType () {
    assert2(this instanceof arguments.callee, 'Constructor called as a function');
}

// Called by IDE when a new object instance of this type is to be created
IDEObjectType.prototype.CreateInstance = function (instance) {
    return new IDEInstance(instance);
};

// Class representing an individual instance of an object in the IDE
function IDEInstance (instance, type) {
    assert2(this instanceof arguments.callee, 'Constructor called as a function');

    // Save the constructor parameters
    this.instance = instance;
    this.type = type;

    // Set the default property values from the property table
    this.properties = {};

    for (var i = 0; i < property_list.length; i++)
        this.properties[ property_list[ i ].name ] = property_list[ i ].initial_value;

    // Plugin-specific variables
    // this.myValue = 0...
}

// Called when inserted via Insert Object Dialog for the first time
IDEInstance.prototype.OnInserted = function () {
    alert('Allows native-like pointer locking for your projects and games.');
};

// Called when double clicked in layout
IDEInstance.prototype.OnDoubleClicked = function () {
};

// Called after a property has been changed in the properties bar
IDEInstance.prototype.OnPropertyChanged = function (property_name) {
    if (property_name === 'Custom Key') {
        var value = this.properties[ property_name ];
        if (value < 8 || value > 222) {
            alert('Value must be between 8 and 222!\nKeycode List: https://goo.gl/A2D8Rd');

            for (var i = 0; i < property_list.length; i++) {
                if (property_list[ i ].name === property_name) {
                    this.properties[ property_name ] = property_list[ i ].initial_value;
                }
            }
        }
    }
};
