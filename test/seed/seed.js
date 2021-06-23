
const personMessage = {
  metadata: {
    recordUid: '25mop1jxq2ss3x',
  },
  data: {
    _id: '5d1f429dbbe76eeb57af028e',
    isUser: false,
    firstName: 'Mark',
    lastName: 'Smith',
    photo: 'https://cdn3.iconfinder.com/data/icons/ultimate-social/150/43_yahoo-512.png',
    // uid: '25mop1jxq2ss3x',
    gender: 'male',
    jobTitle: '',
    nickname: '',
    displayName: '',
    middleName: '',
    salutation: 'Mr',
    title: '',
    birthday: '',
    lastUpdate: '1562409837891',
    updateEvent: '7q9m1jxreh6ir',
    meta: {
      role: 'USER',
      user: '5d1f42743805f3001257392e',
      tenant: '5d1f420d3805f3001257392d',
      username: 'mark.smith@yahoo.com',
    },
    addresses: [{
      street: 'Main Str.',
      streetNumber: '123',
      city: 'Hamburg',
    }],
    contactData: [
      {
        type: 'email',
        value: 'info@smith.com',
        description: 'public',
      },
      {
        type: 'phone',
        value: '123456',
        description: 'private',
      },
    ],
    categories: [
      'Customer',
      'Just the best',
    ],
    relations: [],
    __v: 0,
    lastUpdateBy: null,
    lastUpdateById: null,
  },
};


const receiverMessage = {
  metadata: {},
  data: {
    id: '279',
    email: 'a@b.de',
    imported: 1598960975,
    bounced: 1627283954,
    group_id: '1123825',
    activated: 1598960975,
    registered: 1598960975,
    deactivated: 0,
    last_ip: '',
    last_location: '',
    last_changed: 1598960975,
    last_client: '',
    points: 0,
    stars: 0,
    tags: ['Customer'],
    source: 'User Import',
    attributes: {
      firstname: 'Stefan',
      name: 'Meyer',
      salutation: 'Herr',
      serial_salutation: 'Sehr geehrter Herr Meyer',
    },
    global_attributes: {
      serienbriefanrede: '',
      firstname: 'Stefan',
      lastname: '',
      name: 'Meyer',
      phone: '123456',
    },
    active: false,
    conversion_rate: 0,
    open_rate: 0,
    click_rate: 0,
  },
};

module.exports = {
  personMessage,
  receiverMessage,
};
