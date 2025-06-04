Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Set the root path to the surveys index
  root "surveys#index"
  
  # RESTful routes for surveys
  resources :surveys do
    # Nested routes for questions
    resources :questions, except: [:index, :show]
    
    # Route for taking a survey
    member do
      get 'take'
      post 'submit'
    end

    resources :responses, only: [:create]
  end
  
  # Route for creating responses
end
