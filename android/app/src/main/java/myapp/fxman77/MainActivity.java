package myapp.fxman77;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import myapp.fxman77.billing.GooglePlayBillingPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(GooglePlayBillingPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
