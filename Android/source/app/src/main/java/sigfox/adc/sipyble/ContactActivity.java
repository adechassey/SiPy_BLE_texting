package sigfox.adc.sipyble;

import android.app.ProgressDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.os.AsyncTask;
import android.os.Bundle;
import android.support.v4.widget.SwipeRefreshLayout;
import android.support.v7.app.AlertDialog;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;
import android.view.View;
import android.widget.AdapterView;
import android.widget.EditText;
import android.widget.ListAdapter;
import android.widget.ListView;
import android.widget.SimpleAdapter;
import android.widget.TextView;
import android.widget.Toast;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import sigfox.adc.sipyble.Handlers.DatabaseHandler;
import sigfox.adc.sipyble.Handlers.HttpHandler;
import sigfox.adc.sipyble.Models.Contact;

public class ContactActivity extends AppCompatActivity {
    private final static String TAG = ContactActivity.class.getSimpleName();

    private TextView content;
    private ProgressDialog pDialog;
    private ListView lv;
    private SwipeRefreshLayout swipeContainer;

    ArrayList<HashMap<String, String>> contactList;

    private List<Contact> contacts = new ArrayList<>();

    private String API_URL = "";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_contact);

        // Lookup the swipe container view
        swipeContainer = (SwipeRefreshLayout) findViewById(R.id.swipeContainer);
        // Setup refresh listener which triggers new data loading
        swipeContainer.setOnRefreshListener(new SwipeRefreshLayout.OnRefreshListener() {
            @Override
            public void onRefresh() {
                contactList.clear();
                // Your code to refresh the list here.
                // Make sure you call swipeContainer.setRefreshing(false)
                // once the network request has completed successfully.
                if (isNetworkAvailable()) {
                    promptDialogAndQueryAPI();
                } else {
                    // SQLite DATABASE READING BECAUSE NO INTERNET CONNECTION
                    getContactsFromDB();
                    // Now we call setRefreshing(false) to signal refresh has finished
                    swipeContainer.setRefreshing(false);
                }
            }
        });
        // Configure the refreshing colors
        swipeContainer.setColorSchemeResources(android.R.color.holo_blue_bright,
                android.R.color.holo_green_light,
                android.R.color.holo_orange_light,
                android.R.color.holo_red_light);

        contactList = new ArrayList<>();
        lv = (ListView) findViewById(R.id.list);

        lv.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {

                TextView contactIdTextView = (TextView) view.findViewById(R.id.contactId);
                String contactId = contactIdTextView.getText().toString();

                Intent returnIntent = new Intent();
                returnIntent.putExtra("contactId", contactId);
                setResult(DeviceControlActivity.RESULT_OK, returnIntent);
                finish();
            }
        });

        getContactsFromDB();
    }


    private boolean isNetworkAvailable() {
        ConnectivityManager connectivityManager
                = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
        NetworkInfo activeNetworkInfo = connectivityManager.getActiveNetworkInfo();
        return activeNetworkInfo != null && activeNetworkInfo.isConnected();
    }

    /**
     * Async task class to get json by making HTTP call
     */
    private class GetContacts extends AsyncTask<Void, Void, Void> {

        @Override
        protected void onPreExecute() {
            super.onPreExecute();
            // Showing progress dialog
            pDialog = new ProgressDialog(ContactActivity.this);
            pDialog.setMessage("Please wait...");
            pDialog.setCancelable(false);
            pDialog.show();
        }

        @Override
        protected Void doInBackground(Void... arg0) {
            HttpHandler sh = new HttpHandler();

            // Making a request to url and getting response
            String jsonStr = sh.makeServiceCall(API_URL);

            Log.e(TAG, "Response from url: " + jsonStr);

            if (jsonStr != null) {
                try {
                    DatabaseHandler db = new DatabaseHandler(getApplicationContext());
                    // Purging Contacts Database
                    db.purge(db.getReadableDatabase());

                    JSONArray contacts = new JSONArray(jsonStr);

                    // looping through All Contacts
                    for (int i = 0; i < contacts.length(); i++) {
                        JSONObject contactJSON = contacts.getJSONObject(i);
                        Integer contactId = contactJSON.optInt("contactId");
                        String firstName = contactJSON.optString("firstname");
                        String lastName = contactJSON.optString("lastname");
                        String phone = contactJSON.optString("phone");

                        // Phone node is JSON Object
                        //JSONObject phone = c.getJSONObject("phone");
                        //String mobile = phone.getString("mobile");
                        //String home = phone.getString("home");
                        //String office = phone.getString("office");

                        // tmp hash map for single contact
                        HashMap<String, String> contactHashMap = new HashMap<>();

                        // adding each child node to HashMap key => value
                        contactHashMap.put("contactId", contactId.toString());
                        contactHashMap.put("firstName", firstName);
                        contactHashMap.put("lastName", lastName);
                        contactHashMap.put("phone", phone);

                        // adding contact to contact list
                        contactList.add(contactHashMap);

                        /**
                         * CRUD Operations
                         * */
                        // Inserting Contacts
                        Contact newContact = new Contact(contactId, firstName, lastName, phone);
                        Log.d(TAG, newContact.getContactId().toString());
                        db.addContact(newContact);
                    }
                } catch (final JSONException e) {
                    Log.e(TAG, "Json parsing error: " + e.getMessage());
                    runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            Toast.makeText(getApplicationContext(),
                                    "Json parsing error: " + e.getMessage(),
                                    Toast.LENGTH_LONG)
                                    .show();
                        }
                    });

                }
            } else {
                Log.e(TAG, "Couldn't get json from server.");
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        Toast.makeText(getApplicationContext(),
                                "Couldn't get json from server. Check LogCat for possible errors!",
                                Toast.LENGTH_LONG)
                                .show();
                    }
                });

            }
            return null;
        }

        @Override
        protected void onPostExecute(Void result) {
            super.onPostExecute(result);
            // Dismiss the progress dialog
            if (pDialog.isShowing())
                pDialog.dismiss();
            /**
             * Updating parsed JSON data into ListView
             * */
            ListAdapter adapter = new SimpleAdapter(
                    ContactActivity.this, contactList,
                    R.layout.list_item_contact, new String[]{"firstName", "lastName", "contactId", "phone"}, new int[]{R.id.firstName, R.id.lastName, R.id.contactId, R.id.phone});

            lv.setAdapter(adapter);

            // Now we call setRefreshing(false) to signal refresh has finished
            swipeContainer.setRefreshing(false);
        }

    }


    private void getContactsFromDB() {
        // Reading all contacts
        Log.d("Reading: ", "Reading all contacts for SQLite DB...");
        DatabaseHandler db = new DatabaseHandler(getApplicationContext());
        List<Contact> contacts = db.getAllContacts();

        for (Contact contact : contacts) {
            String log = "ContactId: " + contact.getContactId() + ", FirstName: " + contact.getFirstName() + ", LastName: " + contact.getLastName() + ", Phone: " + contact.getPhone();
            // Writing Contacts to log
            Log.d("Contact: ", log);

            // tmp hash map for single contact
            HashMap<String, String> contactHashMap = new HashMap<>();

            // adding each child node to HashMap key => value
            contactHashMap.put("contactId", contact.getContactId().toString());
            contactHashMap.put("firstName", contact.getFirstName());
            contactHashMap.put("lastName", contact.getLastName());
            contactHashMap.put("phone", contact.getPhone());
            // adding contact to contact list
            contactList.add(contactHashMap);
        }

        /**
         * Updating parsed data into ListView
         * */
        ListAdapter adapter = new SimpleAdapter(
                ContactActivity.this, contactList,
                R.layout.list_item_contact, new String[]{"firstName", "lastName", "contactId", "phone"}, new int[]{R.id.firstName, R.id.lastName, R.id.contactId, R.id.phone});

        lv.setAdapter(adapter);
    }

    /**
     * Prompt dialog demo
     * it is used when you want to capture user input
     */

    private void promptDialogAndQueryAPI() {
        final EditText edtText = new EditText(this);

        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle("EvenNode API");
        builder.setMessage("Type in your app name found in your URL\n \"http://<app_name>.evennode.com\"");
        builder.setCancelable(false);
        builder.setView(edtText);
        builder.setNegativeButton("Cancel", new DialogInterface.OnClickListener(){
            @Override
            public void onClick(DialogInterface dialog, int which) {
                swipeContainer.setRefreshing(false);
            }
        });
        builder.setPositiveButton("Validate", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
                API_URL = "http://" + edtText.getText().toString() + ".evennode.com/contactsAndroid";

                new GetContacts().execute();
            }
        });
        builder.show();
    }
}
