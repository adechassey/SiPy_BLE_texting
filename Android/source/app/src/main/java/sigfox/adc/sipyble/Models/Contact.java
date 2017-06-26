package sigfox.adc.sipyble.Models;

/**
 * Created by Antoine de Chassey on 22/05/2017.
 */

public class Contact {

    private Integer contactId;
    private String firstName;
    private String lastName;
    private String phone;

    // Empty constructor
    public Contact(){

    }

    public Contact(Integer contactId, String firstName, String lastName, String phone) {
        this.contactId = contactId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.phone = phone;
    }

    public Integer getContactId() {
        return contactId;
    }

    public void setContactId(Integer contactId) {
        this.contactId = contactId;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }
}
